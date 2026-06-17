import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { join } from 'path';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import * as sharp from 'sharp';
import { DorsalConfig, DorsalImagen, DorsalBaseImagen } from './entities';
import { CreateDorsalConfigDto } from './dto/create-dorsal-config.dto';
import { Inscrito } from '../inscritos/entities/inscrito.entity';
import { MailService } from '../mail/mail.service';

const opentype = require('opentype.js');
const wawoff2 = require('wawoff2');

interface EmailTask {
  id: string;
  status: 'pending' | 'processing' | 'completed';
  total: number;
  enviados: number;
  fallidos: { id: number; error: string }[];
  createdAt: Date;
}

@Injectable()
export class DorsalesService {
  private readonly emailTasks = new Map<string, EmailTask>();
  private taskCounter = 0;
  private readonly uploadDir: string;
  private readonly DFLT = { posicionX: 400, posicionY: 500, fontSize: 72, fontFamily: 'sans-serif', fontColor: '#000000' };
  private font: any = null;
  private readonly logger = new Logger(DorsalesService.name);

  constructor(
    @InjectRepository(DorsalConfig)
    private readonly configRepo: Repository<DorsalConfig>,
    @InjectRepository(DorsalBaseImagen)
    private readonly baseImagenRepo: Repository<DorsalBaseImagen>,
    @InjectRepository(DorsalImagen)
    private readonly imagenRepo: Repository<DorsalImagen>,
    @InjectRepository(Inscrito)
    private readonly inscritoRepo: Repository<Inscrito>,
    private readonly mailService: MailService,
  ) {
    this.uploadDir = join(process.cwd(), 'uploads', 'dorsales');
    if (!existsSync(this.uploadDir)) mkdirSync(this.uploadDir, { recursive: true });
    this.cargarFont();
  }

  private cargarFont() {
    const load = async () => {
      for (const p of [
        join(__dirname, '..', '..', 'node_modules', '@fontsource', 'roboto', 'files', 'roboto-latin-400-normal.woff2'),
        join(process.cwd(), 'node_modules', '@fontsource', 'roboto', 'files', 'roboto-latin-400-normal.woff2'),
      ]) {
        try {
          const compressed = readFileSync(p);
          const decompressed = await wawoff2.decompress(compressed);
          this.font = opentype.parse(decompressed);
          return;
        } catch {}
      }
    };
    load().catch(() => {});
  }

  private textToSvgPath(text: string, x: number, y: number, fontSize: number, fontColor: string): string {
    if (!this.font) {
      return `<text x="${x}" y="${y}" font-size="${fontSize}" font-family="sans-serif" fill="${fontColor}" text-anchor="middle">${this.escapeXml(text)}</text>`;
    }

    const scale = (1 / this.font.unitsPerEm) * fontSize;
    const glyphs: any[] = [];
    let totalWidth = 0;
    for (const ch of text) {
      const g = this.font.charToGlyph(ch);
      glyphs.push(g);
      if (g.advanceWidth) totalWidth += g.advanceWidth * scale;
    }

    let cursorX = x - totalWidth / 2;
    const paths: string[] = [];
    for (const g of glyphs) {
      const p = g.getPath(cursorX, y, fontSize);
      if (p.commands.length > 0) {
        const svg = p.toSVG(2);
        paths.push(svg.replace('<path', '<path fill="' + fontColor + '"'));
      }
      if (g.advanceWidth) cursorX += g.advanceWidth * scale;
    }

    return paths.join('\n');
  }

  private async overlayText(
    imageBuffer: Buffer,
    items: { text: string; x: number; y: number; fontSize: number; fontColor: string }[],
  ): Promise<Buffer> {
    const metadata = await sharp(imageBuffer).metadata();
    const imgWidth = metadata.width || 800;
    const imgHeight = metadata.height || 600;

    const paths = items.map(l => this.textToSvgPath(l.text, l.x, l.y, l.fontSize, l.fontColor)).join('\n');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${imgWidth}" height="${imgHeight}">${paths}</svg>`;

    return sharp(imageBuffer)
      .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
      .jpeg({ quality: 90 })
      .toBuffer();
  }

  private async overlayTextToFile(
    imageBuffer: Buffer,
    items: { text: string; x: number; y: number; fontSize: number; fontColor: string }[],
    outputPath: string,
  ): Promise<void> {
    const metadata = await sharp(imageBuffer).metadata();
    const imgWidth = metadata.width || 800;
    const imgHeight = metadata.height || 600;

    const paths = items.map(l => this.textToSvgPath(l.text, l.x, l.y, l.fontSize, l.fontColor)).join('\n');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${imgWidth}" height="${imgHeight}">${paths}</svg>`;

    await sharp(imageBuffer)
      .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
      .jpeg({ quality: 90 })
      .toFile(outputPath);
  }

  async saveConfig(dto: CreateDorsalConfigDto): Promise<DorsalConfig> {
    const existing = await this.configRepo.findOne({ where: { idevento: dto.idevento } });
    if (existing) {
      Object.assign(existing, dto);
      return this.configRepo.save(existing);
    }
    return this.configRepo.save(this.configRepo.create(dto));
  }

  async getConfig(idevento: number): Promise<DorsalConfig> {
    const config = await this.configRepo.findOne({ where: { idevento } });
    if (!config) throw new NotFoundException(`No hay config para evento #${idevento}`);
    return config;
  }

  async subirBaseImagen(
    idevento: number,
    fileBuffer: Buffer,
    competencias?: string,
    categorias?: string,
    sexos?: string,
    posicionX?: number,
    posicionY?: number,
    fontSize?: number,
    fontFamily?: string,
    fontColor?: string,
    camposMostrar?: string,
  ): Promise<DorsalBaseImagen> {
    const eventDir = join(this.uploadDir, String(idevento), 'base');
    if (!existsSync(eventDir)) mkdirSync(eventDir, { recursive: true });

    const fileName = `base_${Date.now()}.jpg`;
    const filePath = join(eventDir, fileName);
    await sharp(fileBuffer).jpeg({ quality: 90 }).toFile(filePath);

    return this.baseImagenRepo.save(
      this.baseImagenRepo.create({
        idevento,
        rutaImagen: filePath,
        competencias: competencias || null,
        categorias: categorias || null,
        sexos: sexos || null,
        posicionX: posicionX ?? null,
        posicionY: posicionY ?? null,
        fontSize: fontSize ?? null,
        fontFamily: fontFamily || null,
        fontColor: fontColor || null,
        camposMostrar: camposMostrar || null,
      }),
    );
  }

  async listarBaseImagenes(idevento: number): Promise<DorsalBaseImagen[]> {
    return this.baseImagenRepo.find({ where: { idevento } });
  }

  async eliminarBaseImagen(id: number): Promise<void> {
    const img = await this.baseImagenRepo.findOne({ where: { id } });
    if (!img) throw new NotFoundException(`Imagen base #${id} no encontrada`);
    await this.baseImagenRepo.remove(img);
  }

  async obtenerBaseImagen(id: number): Promise<DorsalBaseImagen> {
    const img = await this.baseImagenRepo.findOne({ where: { id } });
    if (!img) throw new NotFoundException(`Imagen base #${id} no encontrada`);
    return img;
  }

  async actualizarBaseImagen(id: number, data: Partial<DorsalBaseImagen>): Promise<DorsalBaseImagen> {
    const img = await this.obtenerBaseImagen(id);
    Object.assign(img, data);
    return this.baseImagenRepo.save(img);
  }

  private getFieldConfig(
    baseImg: DorsalBaseImagen,
    campo: string,
    globalDefaults: Record<string, any>,
  ): { posicionX: number; posicionY: number; fontSize: number; fontFamily: string; fontColor: string } {
    const fc = baseImg.camposConfig?.[campo];
    return {
      posicionX: fc?.posicionX ?? globalDefaults.posicionX ?? this.DFLT.posicionX,
      posicionY: fc?.posicionY ?? globalDefaults.posicionY ?? this.DFLT.posicionY,
      fontSize: fc?.fontSize ?? globalDefaults.fontSize ?? this.DFLT.fontSize,
      fontFamily: fc?.fontFamily ?? globalDefaults.fontFamily ?? this.DFLT.fontFamily,
      fontColor: fc?.fontColor ?? globalDefaults.fontColor ?? this.DFLT.fontColor,
    };
  }

  private async generarInscritos(
    idevento: number,
    inscritos: Inscrito[],
    deleteExisting: boolean,
  ): Promise<{ total: number; generadas: string[] }> {
    if (deleteExisting) await this.imagenRepo.delete({ idevento });

    const config = await this.configRepo.findOne({ where: { idevento } });
    const defaults = config || { posicionX: 400, posicionY: 500, fontSize: 72, fontFamily: 'sans-serif', fontColor: '#000000' };

    if (!inscritos.length) throw new NotFoundException(`No hay inscritos en evento #${idevento}`);

    const bases = await this.baseImagenRepo.find({ where: { idevento } });
    if (!bases.length) throw new BadRequestException(`Sube al menos una imagen base para el evento #${idevento}`);

    const eventDir = join(this.uploadDir, String(idevento));
    if (!existsSync(eventDir)) mkdirSync(eventDir, { recursive: true });

    const generadas: string[] = [];

    for (const inscrito of inscritos) {
      const c = inscrito.competidor;
      const idCompetencia = String(inscrito.idcompetencia || '');
      const idCategoria = String(inscrito.idcategoria || '');
      const sexo = c?.sexo || '';

      const baseImg = this.encontrarBase(bases, idCompetencia, idCategoria, sexo);
      if (!baseImg) continue;

      const campos = (baseImg.camposMostrar || 'numero').split(',').map(s => s.trim());
      const imageBuffer = require('fs').readFileSync(baseImg.rutaImagen);

      const lines: { text: string; y: number; cfg: ReturnType<typeof this.getFieldConfig> }[] = [];

      if (campos.includes('numero')) {
        const cfg = this.getFieldConfig(baseImg, 'numero', defaults);
        lines.push({ text: String(inscrito.numero || inscrito.id), y: cfg.posicionY, cfg });
      }

      if (campos.includes('nombre') && c) {
        const nombre = `${c.nombre || ''} ${c.apellido || ''}`.trim();
        if (nombre) {
          const cfg = this.getFieldConfig(baseImg, 'nombre', defaults);
          lines.push({ text: nombre, y: cfg.posicionY, cfg });
        }
      }

      if (campos.includes('iddocumento') && c?.iddocumento) {
        const cfg = this.getFieldConfig(baseImg, 'iddocumento', defaults);
        lines.push({ text: `Doc: ${c.iddocumento}`, y: cfg.posicionY, cfg });
      }

      if (campos.includes('sexo') && c?.sexo) {
        const cfg = this.getFieldConfig(baseImg, 'sexo', defaults);
        lines.push({ text: `Sexo: ${c.sexo}`, y: cfg.posicionY, cfg });
      }

      if (campos.includes('equipo') && c?.equipo) {
        const cfg = this.getFieldConfig(baseImg, 'equipo', defaults);
        lines.push({ text: `Equipo: ${c.equipo}`, y: cfg.posicionY, cfg });
      }

      if (campos.includes('competencia') && inscrito.competencia?.descripcion) {
        const cfg = this.getFieldConfig(baseImg, 'competencia', defaults);
        lines.push({ text: inscrito.competencia.descripcion, y: cfg.posicionY, cfg });
      }

      if (campos.includes('categoria') && inscrito.categoria?.descripcion) {
        const cfg = this.getFieldConfig(baseImg, 'categoria', defaults);
        lines.push({ text: `Cat: ${inscrito.categoria.descripcion}`, y: cfg.posicionY, cfg });
      }

      const outputName = `${c?.iddocumento || inscrito.id}_${Date.now()}.jpg`;
      const outputPath = join(eventDir, outputName);

      await this.overlayTextToFile(imageBuffer, lines.map(l => ({
        text: l.text, x: l.cfg.posicionX, y: l.y,
        fontSize: l.cfg.fontSize, fontColor: l.cfg.fontColor,
      })), outputPath);

      const docId = c?.iddocumento || '';
      await this.imagenRepo.save(
        this.imagenRepo.create({ idevento, idinscrito: Number(inscrito.id), iddocumento: docId, rutaImagen: outputPath }),
      );
      generadas.push(outputName);
    }

    return { total: generadas.length, generadas };
  }

  async generar(idevento: number): Promise<{ total: number; generadas: string[] }> {
    const inscritos = await this.inscritoRepo.find({
      where: { evento: { id: idevento } },
      relations: ['competidor', 'competencia', 'categoria'],
    });
    return this.generarInscritos(idevento, inscritos, true);
  }

  async generarPorDocumentos(idevento: number, documentos: string[]): Promise<{ total: number; generadas: string[] }> {
    const existentes = await this.imagenRepo.find({ where: { idevento, iddocumento: In(documentos) } });
    for (const img of existentes) {
      try { require('fs').unlinkSync(img.rutaImagen); } catch {}
    }
    await this.imagenRepo.delete({ idevento, iddocumento: In(documentos) });

    const inscritos = await this.inscritoRepo.find({
      where: { evento: { id: idevento } },
      relations: ['competidor', 'competencia', 'categoria'],
    });
    const filtrados = inscritos.filter(i => i.competidor?.iddocumento && documentos.includes(i.competidor.iddocumento));
    return this.generarInscritos(idevento, filtrados, false);
  }

  async generarPreview(
    idbaseimagen: number,
    camposConfig: { campo: string; posicionX: number; posicionY: number; fontSize: number; fontFamily: string; fontColor: string; valor: string }[],
  ): Promise<Buffer> {
    const baseImg = await this.obtenerBaseImagen(idbaseimagen);
    const imageBuffer = require('fs').readFileSync(baseImg.rutaImagen);

    return this.overlayText(imageBuffer, camposConfig.map(fc => ({
      text: fc.valor, x: fc.posicionX, y: fc.posicionY,
      fontSize: fc.fontSize, fontColor: fc.fontColor,
    })));
  }

  private encontrarBase(bases: DorsalBaseImagen[], idCompetencia: string, idCategoria: string, sexo: string): DorsalBaseImagen | undefined {
    const exacta = bases.find(b => {
      const comps = (b.competencias || '').split(',').map(s => s.trim()).filter(Boolean);
      const cats = (b.categorias || '').split(',').map(s => s.trim()).filter(Boolean);
      const sexos = (b.sexos || '').split(',').map(s => s.trim()).filter(Boolean);
      const matchComp = comps.length === 0 || comps.includes(idCompetencia);
      const matchCat = cats.length === 0 || cats.includes(idCategoria);
      const matchSex = sexos.length === 0 || sexos.includes(sexo);
      return matchComp && matchCat && matchSex;
    });
    if (exacta) return exacta;
    return bases.find(b => !b.competencias && !b.categorias && !b.sexos);
  }

  async buscarPorDocumentoEnEvento(idevento: number, iddocumento: string): Promise<any[]> {
    const imagenes = await this.imagenRepo.find({ where: { idevento, iddocumento } });
    if (!imagenes.length) throw new NotFoundException(`No se encontraron dorsales para documento: ${iddocumento} en evento: ${idevento}`);

    const valids: DorsalImagen[] = [];
    const orphans: DorsalImagen[] = [];
    for (const img of imagenes) {
      if (existsSync(img.rutaImagen)) valids.push(img);
      else orphans.push(img);
    }
    if (orphans.length) await this.imagenRepo.remove(orphans);
    if (!valids.length) throw new NotFoundException(`No se encontraron dorsales para documento: ${iddocumento} en evento: ${idevento}`);

    const result: any[] = [];
    for (const img of valids) {
      const item: any = { id: img.id, iddocumento: img.iddocumento };
      try {
        const inscrito = await this.inscritoRepo.findOne({
          where: { id: String(img.idinscrito) },
          relations: ['competidor', 'competencia', 'categoria'],
        });
        if (inscrito) {
          const c = inscrito.competidor;
          item.nombre = c ? `${c.nombre || ''} ${c.apellido || ''}`.trim() : '';
          item.sexo = c?.sexo || '';
          item.competencia = inscrito.competencia?.descripcion || '';
          item.categoria = inscrito.categoria?.descripcion || '';
        }
      } catch {}
      result.push(item);
    }
    return result;
  }

  async buscarPorDocumento(iddocumento: string): Promise<any[]> {
    const imagenes = await this.imagenRepo.find({ where: { iddocumento } });
    if (!imagenes.length) throw new NotFoundException(`No se encontraron dorsales para documento: ${iddocumento}`);

    const valids: DorsalImagen[] = [];
    const orphans: DorsalImagen[] = [];
    for (const img of imagenes) {
      if (existsSync(img.rutaImagen)) valids.push(img);
      else orphans.push(img);
    }
    if (orphans.length) await this.imagenRepo.remove(orphans);
    if (!valids.length) throw new NotFoundException(`No se encontraron dorsales para documento: ${iddocumento}`);

    const result: any[] = [];
    for (const img of valids) {
      const item: any = { id: img.id, iddocumento: img.iddocumento };
      try {
        const inscrito = await this.inscritoRepo.findOne({
          where: { id: String(img.idinscrito) },
          relations: ['competidor', 'competencia', 'categoria'],
        });
        if (inscrito) {
          const c = inscrito.competidor;
          item.nombre = c ? `${c.nombre || ''} ${c.apellido || ''}`.trim() : '';
          item.sexo = c?.sexo || '';
          item.competencia = inscrito.competencia?.descripcion || '';
          item.categoria = inscrito.categoria?.descripcion || '';
        }
      } catch {}
      result.push(item);
    }
    return result;
  }

  async listarDorsales(idevento: number): Promise<any[]> {
    const imagenes = await this.imagenRepo.find({ where: { idevento } });
    const result: any[] = [];
    for (const img of imagenes) {
      if (!existsSync(img.rutaImagen)) {
        await this.imagenRepo.remove(img);
        continue;
      }
      const item: any = { id: img.id, iddocumento: img.iddocumento, enviado: img.enviado };
      try {
        const inscrito = await this.inscritoRepo.findOne({
          where: { id: String(img.idinscrito) },
          relations: ['competidor', 'competencia', 'categoria'],
        });
        if (inscrito) {
          const c = inscrito.competidor;
          item.nombre = c ? `${c.nombre || ''} ${c.apellido || ''}`.trim() : '';
          item.sexo = c?.sexo || '';
          item.emailpersonal = c?.emailpersonal || null;
          item.email = c?.email || null;
          item.competencia = inscrito.competencia?.descripcion || '';
          item.categoria = inscrito.categoria?.descripcion || '';
          item.numero = inscrito.numero;
        }
      } catch {}
      result.push(item);
    }
    return result;
  }

  async desmarcarEnviado(id: number): Promise<{ id: number }> {
    const img = await this.imagenRepo.findOne({ where: { id } });
    if (!img) throw new NotFoundException('Dorsal no encontrado');
    img.enviado = false;
    await this.imagenRepo.save(img);
    return { id };
  }

  getEmailTaskStatus(taskId: string): EmailTask {
    const task = this.emailTasks.get(taskId);
    if (!task) throw new NotFoundException('Task no encontrada');
    return task;
  }

  async enviarTodos(
    idevento: number,
    subject: string,
    message: string,
  ): Promise<{ task_id: string }> {
    const dorsales = await this.imagenRepo.find({ where: { idevento } });
    const ids = dorsales.map(d => d.id);
    return this.enviarEmail(ids, subject, message);
  }

  async enviarEmail(
    dorsalIds: number[],
    subject: string,
    message: string,
  ): Promise<{ task_id: string }> {
    const taskId = `email_${Date.now()}_${++this.taskCounter}`;
    const task: EmailTask = {
      id: taskId,
      status: 'pending',
      total: dorsalIds.length,
      enviados: 0,
      fallidos: [],
      createdAt: new Date(),
    };
    this.emailTasks.set(taskId, task);

    this.processEmailBatch(task, dorsalIds, subject, message).catch(err => {
      this.logger.error(`Error crítico en envío batch: ${err.message}`, err.stack);
    });

    return { task_id: taskId };
  }

  private async processEmailBatch(
    task: EmailTask,
    ids: number[],
    subject: string,
    message: string,
  ): Promise<void> {
    task.status = 'processing';
    const CONCURRENCY = 5;

    for (let i = 0; i < ids.length; i += CONCURRENCY) {
      const batch = ids.slice(i, i + CONCURRENCY);

      const results = await Promise.allSettled(
        batch.map(id => this.sendSingleDorsal(id, subject, message)),
      );

      for (const result of results) {
        if (result.status === 'fulfilled') {
          if (result.value.success) {
            task.enviados++;
          } else {
            task.fallidos.push({ id: result.value.id, error: result.value.error });
          }
        }
      }

      if (i + CONCURRENCY < ids.length) {
        await new Promise(r => setTimeout(r, 200));
      }
    }

    task.status = 'completed';
  }

  private async sendSingleDorsal(
    id: number,
    subject: string,
    message: string,
  ): Promise<{ id: number; success: boolean; error?: string }> {
    try {
      const img = await this.imagenRepo.findOne({ where: { id } });
      if (!img) return { id, success: false, error: 'Dorsal no encontrado' };
      if (img.enviado) return { id, success: false, error: 'El dorsal ya fue enviado anteriormente' };

      const inscrito = await this.inscritoRepo.findOne({
        where: { id: String(img.idinscrito) },
        relations: ['competidor'],
      });
      if (!inscrito) return { id, success: false, error: 'Inscrito no encontrado' };

      const email = inscrito.competidor?.emailpersonal || inscrito.competidor?.email;
      if (!email) return { id, success: false, error: 'El participante no tiene email registrado' };
      if (!existsSync(img.rutaImagen)) return { id, success: false, error: 'Archivo de imagen no encontrado' };

      const buffer = readFileSync(img.rutaImagen);
      const nombre = `${inscrito.competidor?.nombre || ''} ${inscrito.competidor?.apellido || ''}`.trim() || 'Participante';

      const ok = await this.mailService.sendDorsalEmail(
        email,
        subject,
        `${message}\n\n---\nNombre: ${nombre}\nDocumento: ${img.iddocumento}`,
        buffer,
        `dorsal_${img.iddocumento}.jpg`,
      );

      if (ok) {
        await this.imagenRepo.update(id, { enviado: true });
        return { id, success: true };
      }
      return { id, success: false, error: 'Error al enviar el correo' };
    } catch (e: any) {
      return { id, success: false, error: e.message || 'Error desconocido' };
    }
  }

  async obtenerImagen(id: number): Promise<DorsalImagen> {
    const imagen = await this.imagenRepo.findOne({ where: { id } });
    if (!imagen) throw new NotFoundException(`Imagen #${id} no encontrada`);
    return imagen;
  }

  async eliminarDorsalesPorEvento(idevento: number): Promise<{ eliminados: number }> {
    const imagenes = await this.imagenRepo.find({ where: { idevento } });
    for (const img of imagenes) {
      try { require('fs').unlinkSync(img.rutaImagen); } catch {}
    }
    await this.imagenRepo.delete({ idevento });
    return { eliminados: imagenes.length };
  }

  async contarDorsalesPorEvento(idevento: number): Promise<{ total: number }> {
    const total = await this.imagenRepo.count({ where: { idevento } });
    return { total };
  }

  private escapeXml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  }
}
