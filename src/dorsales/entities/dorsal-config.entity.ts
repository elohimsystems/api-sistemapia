import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('dorsales_config', { schema: 'piaaccess' })
export class DorsalConfig {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: number;

  @Column('bigint', { name: 'idevento', unique: true })
  idevento: number;

  @Column('integer', { name: 'posicion_x', default: 400 })
  posicionX: number;

  @Column('integer', { name: 'posicion_y', default: 500 })
  posicionY: number;

  @Column('integer', { name: 'font_size', default: 72 })
  fontSize: number;

  @Column('character varying', { name: 'font_family', length: 100, default: 'sans-serif' })
  fontFamily: string;

  @Column('character varying', { name: 'font_color', length: 20, default: '#000000' })
  fontColor: string;

  @Column('text', { name: 'campos_mostrar', default: 'numero' })
  camposMostrar: string;
}
