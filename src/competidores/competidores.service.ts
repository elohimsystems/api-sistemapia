import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCompetidoreDto } from './dto/create-competidore.dto';
import { UpdateCompetidoreDto } from './dto/update-competidore.dto';
import { Competidor } from './entities/competidore.entity';

@Injectable()
export class CompetidoresService {
  constructor(
    @InjectRepository(Competidor)
    private readonly competidorRepository: Repository<Competidor>,
  ) {}

  async create(
    createCompetidoreDto: CreateCompetidoreDto,
  ): Promise<Competidor> {
    const competidor = this.competidorRepository.create(createCompetidoreDto);
    return this.competidorRepository.save(competidor);
  }

  async findAll(): Promise<Competidor[]> {
    return this.competidorRepository.find({
      relations: ['inscritos', 'estado'],
    });
  }

  async findOne(id: number): Promise<Competidor> {
    const competidor = await this.competidorRepository.findOne({
      where: { id },
      relations: ['inscritos', 'estado'],
    });
    if (!competidor) {
      throw new NotFoundException(`Competidor with id ${id} not found`);
    }
    return competidor;
  }

  async update(
    id: number,
    updateCompetidoreDto: UpdateCompetidoreDto,
  ): Promise<Competidor> {
    const competidor = await this.findOne(id);
    Object.assign(competidor, updateCompetidoreDto);
    return this.competidorRepository.save(competidor);
  }

  async remove(id: number): Promise<void> {
    const competidor = await this.findOne(id);
    await this.competidorRepository.remove(competidor);
  }
}
