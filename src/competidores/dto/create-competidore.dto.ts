import { IsOptional, IsString, IsNumber, MaxLength } from 'class-validator';

export class CreateCompetidoreDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  iddocumento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  apellido?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  foto?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1)
  sexo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  equipo?: string;

  @IsOptional()
  @IsString()
  edad?: string;

  @IsOptional()
  @IsNumber()
  peso?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1)
  condicion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  telefono?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  idrepresentante?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  nombrerepresentante?: string;

  @IsOptional()
  @IsString()
  @MaxLength(254)
  emailpersonal?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1)
  estadocivil?: string;

  @IsOptional()
  @IsNumber()
  estatura?: number;

  @IsOptional()
  @IsString()
  @MaxLength(9)
  gruposanguineo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  alergicoa?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  direccion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  tallafranela?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  tallamono?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  tallazapatos?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  tallachaqueta?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  tallachemis?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  tallaguantes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  entrenador?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  fileiddocumento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  filepartidanacimiento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  filecertificadodeportivo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  discapacitado?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  tipodiscapacidad?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  textodorsal?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefonoemergencia?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  seguromedico?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  generico01?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  localidad?: string;

  @IsOptional()
  @IsNumber()
  idestado?: number;
}
