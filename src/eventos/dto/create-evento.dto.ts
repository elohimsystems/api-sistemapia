import { IsOptional, IsString, IsNumber, MaxLength } from 'class-validator';

export class CreateEventoDto {
  @IsOptional()
  @IsString()
  @MaxLength(40)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  logo?: string;

  @IsOptional()
  @IsNumber()
  ciudad?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  lugar?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  organizador?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  nombrecontacto?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  telefonocontacto?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  puntoinscripcion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  equipo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1)
  tipo?: string;

  @IsOptional()
  @IsNumber()
  cupomaximo?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  emailcontacto?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  zonahoraria?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  clasificacion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  rutamapa?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  rutaperfil?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  rutavideo?: string;

  @IsOptional()
  @IsNumber()
  organizadorRel?: number;

  @IsOptional()
  @IsNumber()
  estado?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  mapalugar?: string;

  @IsOptional()
  @IsNumber()
  registropago?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  etiquetacompetencias?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  localidad?: string;
}
