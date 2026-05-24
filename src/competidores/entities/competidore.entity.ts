import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Inscrito } from '../../inscritos/entities/inscrito.entity';

@Index('tmcompetidores_emailpersonal_un', ['emailpersonal'], { unique: true })
@Index('tmcompetidores_pkey', ['id'], { unique: true })
@Entity('tmcompetidores', { schema: 'piaaccess' })
export class Competidor {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: number;

  @Column('character varying', {
    name: 'iddocumento',
    nullable: true,
    length: 20,
  })
  iddocumento: string | null;

  @Column('character varying', { name: 'nombre', nullable: true, length: 30 })
  nombre: string | null;

  @Column('character varying', { name: 'apellido', nullable: true, length: 30 })
  apellido: string | null;

  @Column('character varying', { name: 'foto', nullable: true, length: 255 })
  foto: string | null;

  @Column('timestamp without time zone', {
    name: 'fechanacimiento',
    nullable: true,
  })
  fechanacimiento: Date | null;

  @Column('character varying', { name: 'sexo', nullable: true, length: 1 })
  sexo: string | null;

  @Column('character varying', { name: 'equipo', nullable: true, length: 255 })
  equipo: string | null;

  @Column('bigint', { name: 'edad', nullable: true })
  edad: string | null;

  @Column('real', { name: 'peso', nullable: true, precision: 24 })
  peso: number | null;

  @Column('character varying', { name: 'condicion', nullable: true, length: 1 })
  condicion: string | null;

  @Column('character varying', { name: 'email', nullable: true, length: 50 })
  email: string | null;

  @Column('character varying', { name: 'telefono', nullable: true, length: 15 })
  telefono: string | null;

  @Column('bigint', { name: 'idpais', nullable: true })
  idpais: string | null;

  @Column('character varying', {
    name: 'tallafranela',
    nullable: true,
    length: 5,
  })
  tallafranela: string | null;

  @Column('boolean', { name: 'certificado', nullable: true })
  certificado: boolean | null;

  @Column('integer', { name: 'publicado', nullable: true })
  publicado: number | null;

  @Column('date', { name: 'fechapublicacion', nullable: true })
  fechapublicacion: string | null;

  @Column('character varying', {
    name: 'idrepresentante',
    nullable: true,
    length: 20,
  })
  idrepresentante: string | null;

  @Column('character varying', {
    name: 'nombrerepresentante',
    nullable: true,
    length: 50,
  })
  nombrerepresentante: string | null;

  @Column('character varying', {
    name: 'emailpersonal',
    nullable: true,
    unique: true,
    length: 254,
  })
  emailpersonal: string | null;

  @Column('character varying', {
    name: 'estadocivil',
    nullable: true,
    length: 1,
  })
  estadocivil: string | null;

  @Column('double precision', {
    name: 'estatura',
    nullable: true,
    precision: 53,
  })
  estatura: number | null;

  @Column('character varying', {
    name: 'gruposanguineo',
    nullable: true,
    length: 9,
  })
  gruposanguineo: string | null;

  @Column('character varying', {
    name: 'alergicoa',
    nullable: true,
    length: 200,
  })
  alergicoa: string | null;

  @Column('character varying', {
    name: 'direccion',
    nullable: true,
    length: 255,
  })
  direccion: string | null;

  @Column('character varying', { name: 'tallamono', nullable: true, length: 5 })
  tallamono: string | null;

  @Column('character varying', {
    name: 'tallazapatos',
    nullable: true,
    length: 5,
  })
  tallazapatos: string | null;

  @Column('character varying', {
    name: 'tallachaqueta',
    nullable: true,
    length: 5,
  })
  tallachaqueta: string | null;

  @Column('character varying', {
    name: 'tallachemis',
    nullable: true,
    length: 5,
  })
  tallachemis: string | null;

  @Column('character varying', {
    name: 'tallaguantes',
    nullable: true,
    length: 5,
  })
  tallaguantes: string | null;

  @Column('character varying', {
    name: 'entrenador',
    nullable: true,
    length: 100,
  })
  entrenador: string | null;

  @Column('character varying', {
    name: 'fileiddocumento',
    nullable: true,
    length: 100,
  })
  fileiddocumento: string | null;

  @Column('character varying', {
    name: 'filepartidanacimiento',
    nullable: true,
    length: 100,
  })
  filepartidanacimiento: string | null;

  @Column('character varying', {
    name: 'filecertificadodeportivo',
    nullable: true,
    length: 100,
  })
  filecertificadodeportivo: string | null;

  @Column('character varying', {
    name: 'discapacitado',
    nullable: true,
    length: 2,
  })
  discapacitado: string | null;

  @Column('character varying', {
    name: 'tipodiscapacidad',
    nullable: true,
    length: 100,
  })
  tipodiscapacidad: string | null;

  @Column('character varying', {
    name: 'textodorsal',
    nullable: true,
    length: 50,
  })
  textodorsal: string | null;

  @Column('character varying', {
    name: 'telefonoemergencia',
    nullable: true,
    length: 20,
  })
  telefonoemergencia: string | null;

  @Column('character varying', {
    name: 'seguromedico',
    nullable: true,
    length: 2,
  })
  seguromedico: string | null;

  @Column('character varying', {
    name: 'generico01',
    nullable: true,
    length: 100,
  })
  generico01: string | null;

  @Column('character varying', {
    name: 'localidad',
    nullable: true,
    length: 100,
  })
  localidad: string | null;

  @Column('bigint', { name: 'idestado', nullable: true })
  idestado: number | null;

  @OneToMany(() => Inscrito, (inscrito) => inscrito.competidor)
  inscritos: Inscrito[];
}
