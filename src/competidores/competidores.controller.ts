import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CompetidoresService } from './competidores.service';
import { CreateCompetidoreDto } from './dto/create-competidore.dto';
import { UpdateCompetidoreDto } from './dto/update-competidore.dto';

@Controller('competidores')
export class CompetidoresController {
  constructor(private readonly competidoresService: CompetidoresService) {}

  @Post()
  create(@Body() createCompetidoreDto: CreateCompetidoreDto) {
    return this.competidoresService.create(createCompetidoreDto);
  }

  @Get()
  findAll() {
    return this.competidoresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.competidoresService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCompetidoreDto: UpdateCompetidoreDto,
  ) {
    return this.competidoresService.update(+id, updateCompetidoreDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.competidoresService.remove(+id);
  }
}
