import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCompetenciaDto } from './dto/create-competencia.dto';
import { UpdateCompetenciaDto } from './dto/update-competencia.dto';
import { Competencia } from './entities/competencia.entity';

@Injectable()
export class CompetenciasService {
  constructor(
    @InjectRepository(Competencia)
    private readonly competenciaRepository: Repository<Competencia>,
  ) {}

  async create(
    createCompetenciaDto: CreateCompetenciaDto,
  ): Promise<Competencia> {
    const competencia = this.competenciaRepository.create(createCompetenciaDto);
    return this.competenciaRepository.save(competencia);
  }

  async findAll(): Promise<Competencia[]> {
    return this.competenciaRepository.find({
      relations: ['inscritos', 'categorias'],
    });
  }

  async findOne(id: number): Promise<Competencia> {
    const competencia = await this.competenciaRepository.findOne({
      where: { id },
      relations: ['inscritos', 'categorias'],
    });
    if (!competencia) {
      throw new NotFoundException(`Competencia with id ${id} not found`);
    }
    return competencia;
  }

  async update(
    id: number,
    updateCompetenciaDto: UpdateCompetenciaDto,
  ): Promise<Competencia> {
    const competencia = await this.findOne(id);
    Object.assign(competencia, updateCompetenciaDto);
    return this.competenciaRepository.save(competencia);
  }

  async remove(id: number): Promise<void> {
    const competencia = await this.findOne(id);
    await this.competenciaRepository.remove(competencia);
  }
}
