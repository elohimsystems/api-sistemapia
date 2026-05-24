import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { Pago } from './entities/pago.entity';

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
  ) {}

  create(createPagoDto: CreatePagoDto) {
    const pago = this.pagoRepository.create(createPagoDto);
    return this.pagoRepository.save(pago);
  }

  findAll() {
    return this.pagoRepository.find();
  }

  findOne(id: number) {
    return this.pagoRepository.findOneBy({ id });
  }

  async update(id: number, updatePagoDto: UpdatePagoDto) {
    await this.pagoRepository.update(id, updatePagoDto);
    return this.pagoRepository.findOneBy({ id });
  }

  async remove(id: number) {
    const pago = await this.pagoRepository.findOneBy({ id });
    if (pago) {
      await this.pagoRepository.remove(pago);
    }
    return pago;
  }
}
