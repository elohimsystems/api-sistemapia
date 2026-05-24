import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CompetenciasService } from './competencias.service';
import { CreateCompetenciaDto } from './dto/create-competencia.dto';
import { UpdateCompetenciaDto } from './dto/update-competencia.dto';

@Controller('competencias')
export class CompetenciasController {
  constructor(private readonly competenciasService: CompetenciasService) {}

  @Post()
  create(@Body() createCompetenciaDto: CreateCompetenciaDto) {
    return this.competenciasService.create(createCompetenciaDto);
  }

  @Get()
  findAll() {
    return this.competenciasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.competenciasService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCompetenciaDto: UpdateCompetenciaDto,
  ) {
    return this.competenciasService.update(+id, updateCompetenciaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.competenciasService.remove(+id);
  }
}
