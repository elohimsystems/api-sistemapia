import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('tmorganizadores_pkey', ['id'], { unique: true })
@Entity('tmorganizadores', { schema: 'piaaccess' })
export class Organizador {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: number;

  @Column('character varying', { name: 'nombre', nullable: true, length: 50 })
  nombre: string | null;

  @Column('character varying', { name: 'abreviado', nullable: true, length: 50 })
  abreviado: string | null;

  @Column('character varying', { name: 'logo', nullable: true })
  logo: string | null;

  @Column('character varying', { name: 'email', nullable: true })
  email: string | null;

  @Column('character varying', { name: 'banco', nullable: true })
  banco: string | null;

  @Column('integer', { name: 'tipocuenta', nullable: true })
  tipocuenta: number | null;

  @Column('character varying', { name: 'numerocuenta', nullable: true })
  numerocuenta: string | null;

  @Column('character varying', { name: 'rif', nullable: true, length: 10 })
  rif: string | null;

  @Column('character varying', { name: 'contacto', nullable: true })
  contacto: string | null;

  @Column('character varying', { name: 'telefonocontacto', nullable: true })
  telefonocontacto: string | null;

  @Column('character varying', { name: 'emailcontacto', nullable: true })
  emailcontacto: string | null;

  @Column('bigint', { name: 'idmoneda', nullable: true })
  idmoneda: number | null;
}
