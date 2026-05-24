import { PartialType } from '@nestjs/mapped-types';
import { CreateCompetidoreDto } from './create-competidore.dto';

export class UpdateCompetidoreDto extends PartialType(CreateCompetidoreDto) {}
