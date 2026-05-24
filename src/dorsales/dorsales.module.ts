import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DorsalesController } from './dorsales.controller';
import { DorsalesService } from './dorsales.service';
import { DorsalConfig, DorsalImagen, DorsalBaseImagen } from './entities';
import { Inscrito } from '../inscritos/entities/inscrito.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DorsalConfig, DorsalImagen, DorsalBaseImagen, Inscrito])],
  controllers: [DorsalesController],
  providers: [DorsalesService],
})
export class DorsalesModule {}
