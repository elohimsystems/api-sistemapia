import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompetenciasService } from './competencias.service';
import { CompetenciasController } from './competencias.controller';
import { Competencia } from './entities/competencia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Competencia])],
  controllers: [CompetenciasController],
  providers: [CompetenciasService],
})
export class CompetenciasModule {}
