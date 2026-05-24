import { IsOptional, IsString, IsNumber, MaxLength } from 'class-validator';

export class CreateCategoriaDto {
  @IsOptional()
  @IsString()
  @MaxLength(30)
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  idcampeonato?: number;

  @IsOptional()
  @IsNumber()
  idcompetencia?: number;
}
