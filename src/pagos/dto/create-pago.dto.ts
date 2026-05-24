import {
  IsOptional,
  IsNumber,
  IsString,
  MaxLength,
  IsBoolean,
} from 'class-validator';

export class CreatePagoDto {
  @IsOptional()
  fechahora: Date | null;

  @IsOptional()
  @IsNumber()
  monto: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  moneda: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  referencia: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  comprobante: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  tipo: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  banco: string | null;

  @IsOptional()
  @IsBoolean()
  conciliado: boolean | null;

  @IsOptional()
  conciliadoel: Date | null;

  @IsOptional()
  @IsNumber()
  idliquidacion: number | null;

  @IsOptional()
  notificado: Date | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  texto: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  idpagador: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombrepagador: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  correopagador: string | null;

  @IsOptional()
  fechapago: Date | null;

  @IsOptional()
  @IsNumber()
  precio: number | null;

  @IsOptional()
  @IsNumber()
  recargas: number | null;

  @IsOptional()
  @IsString()
  idinscrito: string;

  @IsOptional()
  @IsNumber()
  idmoneda: number;

  @IsOptional()
  @IsNumber()
  idbanco: number;

  @IsOptional()
  @IsNumber()
  idformapago: number;
}
