import { Module } from '@nestjs/common';
import { InscritosService } from './inscritos.service';
import { InscritosController } from './inscritos.controller';
import { Inscrito } from './entities/inscrito.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Inscrito])],
  controllers: [InscritosController],
  providers: [InscritosService],
})
export class InscritosModule {}
