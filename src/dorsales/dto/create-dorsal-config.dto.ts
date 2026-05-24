import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDorsalConfigDto {
  @IsNumber()
  idevento: number;

  @IsOptional()
  @IsNumber()
  posicionX?: number;

  @IsOptional()
  @IsNumber()
  posicionY?: number;

  @IsOptional()
  @IsNumber()
  fontSize?: number;

  @IsOptional()
  @IsString()
  fontFamily?: string;

  @IsOptional()
  @IsString()
  fontColor?: string;

  @IsOptional()
  @IsString()
  camposMostrar?: string;
}
