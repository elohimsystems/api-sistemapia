import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { InscritosService } from './inscritos.service';
import { CreateInscritoDto } from './dto/create-inscrito.dto';
import { UpdateInscritoDto } from './dto/update-inscrito.dto';

@Controller('inscritos')
export class InscritosController {
  constructor(private readonly inscritosService: InscritosService) {}

  @Post()
  create(@Body() createInscritoDto: CreateInscritoDto) {
    return this.inscritosService.create(createInscritoDto);
  }

  @Get()
  findAll() {
    return this.inscritosService.findAll();
  }

  @Get('evento/:idevento')
  findByEvento(@Param('idevento', ParseIntPipe) idevento: number) {
    return this.inscritosService.findByEvento(idevento);
  }

  @Post('asignar-numeros')
  async asignarNumeros() {
    return this.inscritosService.asignarNumerosAleatorios();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inscritosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInscritoDto: UpdateInscritoDto,
  ) {
    return this.inscritosService.update(id, updateInscritoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inscritosService.remove(id);
  }
}
