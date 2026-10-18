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
    const candidates = [
      join(process.cwd(), 'uploads', 'eventos', folder, file),
      join(process.cwd(), 'uploads', 'logos', folder, file),
      join(process.cwd(), 'uploads', folder, file),
    ];
    for (const path of candidates) {
      if (existsSync(path)) {
        return new StreamableFile(createReadStream(path), { type: 'image/jpeg' });
      }
    }
    throw new NotFoundException('Logo de evento no encontrado');
  }

  @Get('logo/:file')
  async verLogoArchivo(@Param('file') file: string): Promise<StreamableFile> {
    const candidates = [
      join(process.cwd(), 'uploads', 'eventos', file),
      join(process.cwd(), 'uploads', 'logos', file),
      join(process.cwd(), 'uploads', file),
    ];
    for (const path of candidates) {
      if (existsSync(path)) {
        return new StreamableFile(createReadStream(path), { type: 'image/jpeg' });
      }
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
