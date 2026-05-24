import { Module } from '@nestjs/common';
import { EventosService } from './eventos.service';
import { EventosController } from './eventos.controller';
import { Evento } from './entities/evento.entity';
import { Ciudad } from '../ciudades/entities/ciudad.entity';
import { Estado } from '../estados/entities/estado.entity';
import { Organizador } from '../organizadores/entities/organizadore.entity';
import { Competencia } from '../competencias/entities/competencia.entity';
import { Categoria } from '../categorias/entities/categoria.entity';
import { Inscrito } from '../inscritos/entities/inscrito.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Evento, Ciudad, Estado, Organizador, Competencia, Categoria, Inscrito])],
  controllers: [EventosController],
  providers: [EventosService],
})
export class EventosModule {}
