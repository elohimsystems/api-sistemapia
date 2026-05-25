import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { join } from 'path';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import * as sharp from 'sharp';
import { DorsalConfig, DorsalImagen, DorsalBaseImagen } from './entities';
import { CreateDorsalConfigDto } from './dto/create-dorsal-config.dto';
import { Inscrito } from '../inscritos/entities/inscrito.entity';

@Injectable()
export class DorsalesService {
  private readonly uploadDir: string;
  private readonly DFLT = { posicionX: 400, posicionY: 500, fontSize: 72, fontFamily: 'sans-serif', fontColor: '#000000' };
  private fontDataUri: string = '';

  constructor(
    @InjectRepository(DorsalConfig)
    private readonly configRepo: Repository<DorsalConfig>,
    @InjectRepository(DorsalBaseImagen)
    private readonly baseImagenRepo: Repository<DorsalBaseImagen>,
    @InjectRepository(DorsalImagen)
    private readonly imagenRepo: Repository<DorsalImagen>,
    @InjectRepository(Inscrito)
    private readonly inscritoRepo: Repository<Inscrito>,
  ) {
    this.uploadDir = join(process.cwd(), 'uploads', 'dorsales');
    if (!existsSync(this.uploadDir)) mkdirSync(this.uploadDir, { recursive: true });
    this.cargarFont();
  }

  private cargarFont() {
    try {
      const fontPath = join(__dirname, '..', '..', 'node_modules', '@fontsource', 'dejavu-sans', 'files', 'dejavu-sans-latin-400-normal.woff2');
      const fontBuf = readFileSync(fontPath);
      this.fontDataUri = 'data:font/woff2;base64,' + fontBuf.toString('base64');
    } catch {
      try {
        const fontPath = join(process.cwd(), 'node_modules', '@fontsource', 'dejavu-sans', 'files', 'dejavu-sans-latin-400-normal.woff2');
        const fontBuf = readFileSync(fontPath);
        this.fontDataUri = 'data:font/woff2;base64,' + fontBuf.toString('base64');
      } catch {}
    }
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

  async generar(idevento: number): Promise<{ total: number; generadas: string[] }> {
    await this.imagenRepo.delete({ idevento });

    const config = await this.configRepo.findOne({ where: { idevento } });
    const defaults = config || { posicionX: 400, posicionY: 500, fontSize: 72, fontFamily: 'sans-serif', fontColor: '#000000' };

    const inscritos = await this.inscritoRepo.find({
      where: { evento: { id: idevento } },
      relations: ['competidor', 'competencia', 'categoria'],
    });

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

  private getFontStyle(): string {
    if (!this.fontDataUri) return '';
    return `<style>@font-face{font-family:'D';src:url(${this.fontDataUri}) format('woff2');}</style>`;
  }

  private async overlayText(
    imageBuffer: Buffer,
    items: { text: string; x: number; y: number; fontSize: number; fontColor: string }[],
  ): Promise<Buffer> {
    const metadata = await sharp(imageBuffer).metadata();
    const imgWidth = metadata.width || 800;
    const imgHeight = metadata.height || 600;

    const style = this.getFontStyle();
    const fontFace = this.fontDataUri ? 'D' : 'sans-serif';
    const svgParts = items.map(l =>
      `<text x="${l.x}" y="${l.y}" font-size="${l.fontSize}" font-family="${fontFace}" fill="${l.fontColor}" text-anchor="middle">${this.escapeXml(l.text)}</text>`,
    ).join('\n');

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${imgWidth}" height="${imgHeight}">${style}${svgParts}</svg>`;

    return sharp(imageBuffer)
      .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
      .jpeg({ quality: 90 })
      .toBuffer();
}

  private escapeXml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  }

  private async overlayTextToFile(
    imageBuffer: Buffer,
    items: { text: string; x: number; y: number; fontSize: number; fontColor: string }[],
    outputPath: string,
  ): Promise<void> {
    const metadata = await sharp(imageBuffer).metadata();
    const imgWidth = metadata.width || 800;
    const imgHeight = metadata.height || 600;

    const svgParts = items.map(l =>
      `<text x="${l.x}" y="${l.y}" font-size="${l.fontSize}" font-family="sans-serif" fill="${l.fontColor}" text-anchor="middle">${this.escapeXml(l.text)}</text>`,
    ).join('\n');

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${imgWidth}" height="${imgHeight}"><style>@font-face{font-family:sans-serif;src:local('DejaVu Sans'),local('Liberation Sans'),local('FreeSans'),local('sans-serif');}</style>${svgParts}</svg>`;

    await sharp(imageBuffer)
      .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
      .jpeg({ quality: 90 })
      .toFile(outputPath);
  }
}
