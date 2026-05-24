import { IsOptional, IsString, IsNumber, MaxLength } from 'class-validator';

export class CreateCompetenciaDto {
  @IsOptional()
  @IsNumber()
  idevento?: number;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  descripcion?: string;

  @IsOptional()
  fechacierre?: Date;

  @IsOptional()
  horacierre?: Date;

  @IsOptional()
  @IsNumber()
  cupomaximo?: number;

  @IsOptional()
  @IsNumber()
  tipoinscripcion?: number;
}
