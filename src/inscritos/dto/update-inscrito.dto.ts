import { PartialType } from '@nestjs/mapped-types';
import { CreateInscritoDto } from './create-inscrito.dto';

export class UpdateInscritoDto extends PartialType(CreateInscritoDto) {}
