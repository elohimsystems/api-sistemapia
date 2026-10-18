import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('config_correo', { schema: 'piaaccess' })
export class ConfigCorreo {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('character varying', { name: 'nombre', length: 100 })
  nombre: string;

  @Column('character varying', { name: 'driver', length: 20, default: 'smtp' })
  driver: string;

  @Column('character varying', { name: 'host', nullable: true, length: 255 })
  host: string | null;

  @Column('integer', { name: 'port', nullable: true, default: 587 })
  port: number | null;

  @Column('boolean', { name: 'secure', default: false })
  secure: boolean;

  @Column('character varying', {
    name: 'user_key',
    nullable: true,
    length: 255,
  })
  userKey: string | null;

  @Column('character varying', {
    name: 'pass_secret',
    nullable: true,
    length: 255,
  })
  passSecret: string | null;

  @Column('character varying', { name: 'from_email', length: 255 })
  fromEmail: string;

  @Column('character varying', {
    name: 'from_name',
    nullable: true,
    length: 255,
  })
  fromName: string | null;

  @Column('boolean', { name: 'activo', default: false })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
