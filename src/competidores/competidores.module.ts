import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompetidoresService } from './competidores.service';
import { CompetidoresController } from './competidores.controller';
import { Competidor } from './entities/competidore.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Competidor])],
  controllers: [CompetidoresController],
  providers: [CompetidoresService],
})
export class CompetidoresModule {}
