import { Controller, Get, Post, Patch, Delete, Param, Body, UploadedFile, UseInterceptors, NotFoundException, BadRequestException, StreamableFile, HttpCode } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream, existsSync } from 'fs';
import { DorsalesService } from './dorsales.service';
import { CreateDorsalConfigDto } from './dto/create-dorsal-config.dto';

@Controller('dorsales')
export class DorsalesController {
  constructor(private readonly dorsalesService: DorsalesService) {}

  @Post('config')
  saveConfig(@Body() dto: CreateDorsalConfigDto) {
    return this.dorsalesService.saveConfig(dto);
  }

  @Get('config/:idevento')
  getConfig(@Param('idevento') idevento: string) {
    return this.dorsalesService.getConfig(+idevento);
  }

  @Post('base-imagen/:idevento')
  @UseInterceptors(FileInterceptor('imagen'))
  async subirBaseImagen(
    @Param('idevento') idevento: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('competencias') competencias?: string,
    @Body('categorias') categorias?: string,
    @Body('sexos') sexos?: string,
    @Body('posicionX') posicionX?: string,
    @Body('posicionY') posicionY?: string,
    @Body('fontSize') fontSize?: string,
    @Body('fontFamily') fontFamily?: string,
    @Body('fontColor') fontColor?: string,
    @Body('camposMostrar') camposMostrar?: string,
  ) {
    if (!file) throw new Error('Debe subir una imagen');
    return this.dorsalesService.subirBaseImagen(
      +idevento, file.buffer, competencias, categorias, sexos,
      posicionX ? +posicionX : undefined,
      posicionY ? +posicionY : undefined,
      fontSize ? +fontSize : undefined,
      fontFamily, fontColor, camposMostrar,
    );
  }

  @Get('base-imagenes/:idevento')
  listarBaseImagenes(@Param('idevento') idevento: string) {
    return this.dorsalesService.listarBaseImagenes(+idevento);
  }

  @Get('base-imagen/:id/imagen')
  async verBaseImagen(@Param('id') id: string): Promise<StreamableFile> {
    const img = await this.dorsalesService.obtenerBaseImagen(+id);
    if (!existsSync(img.rutaImagen)) throw new NotFoundException('Archivo no encontrado en disco');
    return new StreamableFile(createReadStream(img.rutaImagen), { type: 'image/jpeg' });
  }

  @Patch('base-imagen/:id')
  async actualizarBaseImagen(
    @Param('id') id: string,
    @Body('posicionX') posicionX?: string,
    @Body('posicionY') posicionY?: string,
    @Body('fontSize') fontSize?: string,
    @Body('fontFamily') fontFamily?: string,
    @Body('fontColor') fontColor?: string,
    @Body('camposMostrar') camposMostrar?: string,
    @Body('competencias') competencias?: string,
    @Body('categorias') categorias?: string,
    @Body('sexos') sexos?: string,
    @Body('camposConfig') camposConfig?: Record<string, any>,
  ) {
    return this.dorsalesService.actualizarBaseImagen(+id, {
      posicionX: posicionX ? +posicionX : undefined,
      posicionY: posicionY ? +posicionY : undefined,
      fontSize: fontSize ? +fontSize : undefined,
      fontFamily, fontColor, camposMostrar, competencias, categorias, sexos, camposConfig,
    });
  }

  @Delete('base-imagen/:id')
  eliminarBaseImagen(@Param('id') id: string) {
    return this.dorsalesService.eliminarBaseImagen(+id);
  }

  @Post('generar/:idevento')
  async generar(@Param('idevento') idevento: string) {
    return this.dorsalesService.generar(+idevento);
  }

  @Post('generar/:idevento/por-documentos')
  async generarPorDocumentos(
    @Param('idevento') idevento: string,
    @Body('documentos') documentos: string[],
  ) {
    if (!documentos?.length) throw new BadRequestException('Debe enviar un arreglo de documentos');
    return this.dorsalesService.generarPorDocumentos(+idevento, documentos);
  }

  @Get('generar/:idevento')
  async contarDorsales(@Param('idevento') idevento: string) {
    return this.dorsalesService.contarDorsalesPorEvento(+idevento);
  }

  @Delete('generar/:idevento')
  async eliminarDorsales(@Param('idevento') idevento: string) {
    return this.dorsalesService.eliminarDorsalesPorEvento(+idevento);
  }

  @Post('preview')
  @HttpCode(200)
  async generarPreview(@Body() body: { idbaseimagen: number; camposConfig: { campo: string; posicionX: number; posicionY: number; fontSize: number; fontFamily: string; fontColor: string; valor: string }[] }): Promise<StreamableFile> {
    const buffer = await this.dorsalesService.generarPreview(body.idbaseimagen, body.camposConfig);
    return new StreamableFile(buffer, { type: 'image/jpeg' });
  }

  @Get('buscar/:iddocumento')
  buscar(@Param('iddocumento') iddocumento: string) {
    return this.dorsalesService.buscarPorDocumento(iddocumento);
  }

  @Get('buscar/:idevento/:iddocumento')
  buscarEnEvento(@Param('idevento') idevento: string, @Param('iddocumento') iddocumento: string) {
    return this.dorsalesService.buscarPorDocumentoEnEvento(+idevento, iddocumento);
  }

  @Post('enviar-email')
  async enviarEmail(@Body() body: { ids: number[]; subject: string; message: string }) {
    if (!body.ids?.length) throw new BadRequestException('Debe enviar un arreglo de ids');
    if (!body.subject) throw new BadRequestException('Debe enviar un subject');
    return this.dorsalesService.enviarEmail(body.ids, body.subject, body.message || '');
  }

  @Post('enviar/:idevento')
  async enviarTodos(@Param('idevento') idevento: string, @Body() body: { subject: string; message: string }) {
    if (!body.subject) throw new BadRequestException('Debe enviar un subject');
    return this.dorsalesService.enviarTodos(+idevento, body.subject, body.message || '');
  }

  @Get('email-task/:taskId')
  getEmailTaskStatus(@Param('taskId') taskId: string) {
    return this.dorsalesService.getEmailTaskStatus(taskId);
  }

  @Patch(':id/desmarcar-enviado')
  async desmarcarEnviado(@Param('id') id: string) {
    return this.dorsalesService.desmarcarEnviado(+id);
  }

  @Get('listar/:idevento')
  async listarDorsales(@Param('idevento') idevento: string) {
    return this.dorsalesService.listarDorsales(+idevento);
  }

  @Get('imagen/:id')
  async verImagen(@Param('id') id: string): Promise<StreamableFile> {
    const imagen = await this.dorsalesService.obtenerImagen(+id);
    if (!existsSync(imagen.rutaImagen)) throw new NotFoundException('Archivo no encontrado');
    return new StreamableFile(createReadStream(imagen.rutaImagen), { type: 'image/jpeg' });
  }
}
