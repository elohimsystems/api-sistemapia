import { IsOptional, IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateInscritoDto {
  @IsOptional()
  @IsNumber()
  numero?: number;

  @IsOptional()
  fechahora?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  punto?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  equipo?: string;

  @IsOptional()
  @IsNumber()
  precio?: number;

  @IsOptional()
  @IsNumber()
  status?: number;

  @IsOptional()
  @IsNumber()
  publicado?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  idgrupo?: string;
}
