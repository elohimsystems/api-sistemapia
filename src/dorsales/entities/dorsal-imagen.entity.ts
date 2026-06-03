import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('dorsales_imagenes', { schema: 'piaaccess' })
export class DorsalImagen {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: number;

  @Column('bigint', { name: 'idevento' })
  idevento: number;

  @Column('bigint', { name: 'idinscrito' })
  idinscrito: number;

  @Column('character varying', { name: 'iddocumento', length: 20 })
  iddocumento: string;

  @Column('character varying', { name: 'ruta_imagen', length: 500 })
  rutaImagen: string;

  @Column('timestamp without time zone', { name: 'generado_el', default: () => 'NOW()' })
  generadoEl: Date;

  @Column('boolean', { name: 'enviado', default: false })
  enviado: boolean;
}
