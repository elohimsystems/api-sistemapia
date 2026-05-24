import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('dorsales_base_imagenes', { schema: 'piaaccess' })
export class DorsalBaseImagen {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: number;

  @Column('bigint', { name: 'idevento' })
  idevento: number;

  @Column('character varying', { name: 'ruta_imagen', length: 500 })
  rutaImagen: string;

  @Column('text', { name: 'competencias', nullable: true })
  competencias: string | null;

  @Column('text', { name: 'categorias', nullable: true })
  categorias: string | null;

  @Column('character varying', { name: 'sexos', nullable: true, length: 50 })
  sexos: string | null;

  @Column('integer', { name: 'posicion_x', nullable: true })
  posicionX: number | null;

  @Column('integer', { name: 'posicion_y', nullable: true })
  posicionY: number | null;

  @Column('integer', { name: 'font_size', nullable: true })
  fontSize: number | null;

  @Column('character varying', { name: 'font_family', nullable: true, length: 100 })
  fontFamily: string | null;

  @Column('character varying', { name: 'font_color', nullable: true, length: 20 })
  fontColor: string | null;

  @Column('text', { name: 'campos_mostrar', nullable: true })
  camposMostrar: string | null;

  @Column('json', { name: 'campos_config', nullable: true })
  camposConfig: Record<string, any> | null;

  @Column('timestamp without time zone', { name: 'subido_el', default: () => 'NOW()' })
  subidoEl: Date;
}
