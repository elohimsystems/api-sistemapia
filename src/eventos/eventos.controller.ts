import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import { EventosService } from './eventos.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';

@Controller('eventos')
export class EventosController {
  constructor(private readonly eventosService: EventosService) {}

  @Post()
  create(@Body() createEventoDto: CreateEventoDto) {
    return this.eventosService.create(createEventoDto);
  }

  @Get()
  findAll() {
    return this.eventosService.findAll();
  }

  @Get('activos')
  findActivos() {
    return this.eventosService.findActivos();
  }

  @Get('logo/:folder/:file')
  async verLogoSubcarpeta(
    @Param('folder') folder: string,
    @Param('file') file: string,
  ): Promise<StreamableFile> {
    const decFolder = decodeURIComponent(folder);
    const decFile = decodeURIComponent(file);

    // 1. Verificar en disco local
    const candidates = [
      join(process.cwd(), 'uploads', 'eventos', decFolder, decFile),
      join(process.cwd(), 'uploads', 'logos', decFolder, decFile),
      join(process.cwd(), 'uploads', decFolder, decFile),
    ];
    for (const path of candidates) {
      if (existsSync(path)) {
        return new StreamableFile(createReadStream(path), { type: 'image/jpeg' });
      }
    }

    // 2. Obtener desde la URL remota del servidor configurada en config.json
    const remoteBuffer = await this.eventosService.fetchRemoteLogoImage(`${decFolder}/${decFile}`);
    if (remoteBuffer) {
      return new StreamableFile(remoteBuffer, { type: 'image/jpeg' });
    }

    throw new NotFoundException('Logo de evento no encontrado');
  }

  @Get('logo/:file')
  async verLogoArchivo(@Param('file') file: string): Promise<StreamableFile> {
    const decFile = decodeURIComponent(file);

    // 1. Verificar en disco local
    const candidates = [
      join(process.cwd(), 'uploads', 'eventos', decFile),
      join(process.cwd(), 'uploads', 'logos', decFile),
      join(process.cwd(), 'uploads', decFile),
    ];
    for (const path of candidates) {
      if (existsSync(path)) {
        return new StreamableFile(createReadStream(path), { type: 'image/jpeg' });
      }
    }

    // 2. Obtener desde la URL remota del servidor configurada en config.json
    const remoteBuffer = await this.eventosService.fetchRemoteLogoImage(decFile);
    if (remoteBuffer) {
      return new StreamableFile(remoteBuffer, { type: 'image/jpeg' });
    }

    throw new NotFoundException('Logo de evento no encontrado');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventoDto: UpdateEventoDto) {
    return this.eventosService.update(+id, updateEventoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventosService.remove(+id);
  }

  @Get(':id/competencias')
  getCompetencias(@Param('id') id: string) {
    return this.eventosService.getCompetenciasPorEvento(+id);
  }

  @Get(':id/categorias')
  getCategorias(@Param('id') id: string) {
    return this.eventosService.getCategoriasPorEvento(+id);
  }

  @Get(':id/inscritos')
  getInscritos(@Param('id') id: string) {
    return this.eventosService.getInscritosPorEvento(+id);
  }
}
