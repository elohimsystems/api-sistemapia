import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInscritoDto } from './dto/create-inscrito.dto';
import { UpdateInscritoDto } from './dto/update-inscrito.dto';
import { Inscrito } from './entities/inscrito.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class InscritosService {
  constructor(
    @InjectRepository(Inscrito)
    private inscritoRepository: Repository<Inscrito>,
  ) {}
  async create(createInscritoDto: CreateInscritoDto) {
    const inscrito = this.inscritoRepository.create(createInscritoDto);
    return await this.inscritoRepository.save(inscrito);
  }

  async findAll(): Promise<Inscrito[]> {
    return await this.inscritoRepository.find({
      relations: ['competidor', 'evento', 'competencia', 'categoria'],
    });
  }

  async findByEvento(idevento: number): Promise<Inscrito[]> {
    return await this.inscritoRepository
      .createQueryBuilder('inscrito')
      .leftJoinAndSelect('inscrito.competidor', 'competidor')
      .leftJoinAndSelect('inscrito.evento', 'evento')
      .leftJoinAndSelect('inscrito.competencia', 'competencia')
      .leftJoinAndSelect('inscrito.categoria', 'categoria')
      .leftJoinAndSelect('inscrito.pagos', 'pagos')
      .where('inscrito.idevento = :idevento', { idevento: String(idevento) })
      .andWhere('inscrito.status = 1')
      .andWhere('pagos.conciliado = true')
      .getMany();
  }

  async findOne(id: number): Promise<Inscrito> {
    const inscrito = await this.inscritoRepository.findOne({
      where: { id: String(id) },
      relations: ['competidor', 'evento', 'competencia', 'categoria', 'pagos'],
    });
    if (!inscrito) throw new NotFoundException(`Inscrito #${id} not found`);
    return inscrito;
  }

  async asignarNumerosAleatorios(): Promise<{ actualizados: number }> {
    const result = await this.inscritoRepository.query(
      `UPDATE piaaccess.tminscritos SET numero = floor(1000 + random() * 9000)::int`,
    );
    return { actualizados: result?.rowCount ?? 0 };
  }

  async update(
    id: number,
    updateInscritoDto: UpdateInscritoDto,
  ): Promise<Inscrito> {
    const inscrito = await this.findOne(id);
    Object.assign(inscrito, updateInscritoDto);
    return await this.inscritoRepository.save(inscrito);
  }

  async remove(id: number): Promise<void> {
    const inscrito = await this.findOne(id);
    await this.inscritoRepository.remove(inscrito);
  }
}
