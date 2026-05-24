import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { Evento } from './entities/evento.entity';
import { Competencia } from '../competencias/entities/competencia.entity';
import { Categoria } from '../categorias/entities/categoria.entity';
import { Inscrito } from '../inscritos/entities/inscrito.entity';

@Injectable()
export class EventosService {
  constructor(
    @InjectRepository(Evento)
    private readonly eventoRepository: Repository<Evento>,
    @InjectRepository(Competencia)
    private readonly competenciaRepository: Repository<Competencia>,
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
    @InjectRepository(Inscrito)
    private readonly inscritoRepository: Repository<Inscrito>,
  ) {}

  async getCompetenciasPorEvento(idevento: number) {
    return this.competenciaRepository.find({ where: { idevento } });
  }

  async getCategoriasPorEvento(idevento: number) {
    return this.categoriaRepository.find({
      where: { competencia: { idevento } },
      relations: ['competencia'],
    });
  }

  async getInscritosPorEvento(idevento: number) {
    return this.inscritoRepository.find({
      where: { evento: { id: idevento } },
      relations: ['competidor', 'competencia', 'categoria'],
    });
  }

  async create(createEventoDto: CreateEventoDto) {
    const { ciudad, estado, organizadorRel, ...rest } = createEventoDto;
    const evento = this.eventoRepository.create({
      ...rest,
      ...(ciudad ? { ciudad: { id: ciudad } as any } : {}),
      ...(estado ? { estado: { id: estado } as any } : {}),
      ...(organizadorRel ? { organizadorRel: { id: organizadorRel } as any } : {}),
    });
    return await this.eventoRepository.save(evento);
  }

  async findAll() {
    return await this.eventoRepository.find({
      relations: ['ciudad', 'organizadorRel', 'estado', 'inscritos'],
    });
  }

  async findOne(id: number) {
    const evento = await this.eventoRepository.findOne({
      where: { id },
      relations: ['ciudad', 'organizadorRel', 'estado', 'inscritos'],
    });
    if (!evento) {
      throw new NotFoundException(`Evento #${id} not found`);
    }
    return evento;
  }

  async update(id: number, updateEventoDto: UpdateEventoDto) {
    const evento = await this.findOne(id);
    const { ciudad, estado, organizadorRel, ...rest } = updateEventoDto;
    Object.assign(evento, rest);
    if (ciudad) evento.ciudad = { id: ciudad } as any;
    if (estado) evento.estado = { id: estado } as any;
    if (organizadorRel) evento.organizadorRel = { id: organizadorRel } as any;
    return await this.eventoRepository.save(evento);
  }

  async remove(id: number) {
    const evento = await this.findOne(id);
    return await this.eventoRepository.remove(evento);
  }
}
