import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Inscrito } from '../../inscritos/entities/inscrito.entity';
import { Ciudad } from '../../ciudades/entities/ciudad.entity';
import { Estado } from '../../estados/entities/estado.entity';
import { Organizador } from '../../organizadores/entities/organizadore.entity';

@Index('tmeventos_pkey', ['id'], { unique: true })
@Entity('tmeventos', { schema: 'piaaccess' })
export class Evento {
  @Column('bigint', { primary: true, name: 'id' })
  id: number;

  @Column('character varying', { name: 'nombre', nullable: true, length: 40 })
  nombre: string | null;
  @Column('character varying', { name: 'logo', nullable: true, length: 255 })
  logo: string | null;
  @Column('timestamp without time zone', { name: 'fecha', nullable: true })
  fecha: Date | null;
  @Column('timestamp without time zone', { name: 'hora', nullable: true })
  hora: Date | null;
  @Column('character varying', { name: 'lugar', nullable: true, length: 50 })
  lugar: string | null;
  @Column('bytea', { name: 'ruta', nullable: true })
  ruta: Buffer | null;
  @Column('character varying', { name: 'organizador', nullable: true, length: 30 })
  organizador: string | null;
  @Column('character varying', { name: 'nombrecontacto', nullable: true, length: 30 })
  nombrecontacto: string | null;
  @Column('character varying', { name: 'telefonocontacto', nullable: true, length: 30 })
  telefonocontacto: string | null;
  @Column('character varying', { name: 'puntoinscripcion', nullable: true, length: 200 })
  puntoinscripcion: string | null;
  @Column('timestamp without time zone', { name: 'fechacierre', nullable: true })
  fechacierre: Date | null;
  @Column('timestamp without time zone', { name: 'fechacierreefectivo', nullable: true })
  fechacierreefectivo: Date | null;
  @Column('timestamp without time zone', { name: 'horacierre', nullable: true })
  horacierre: Date | null;
  @Column('character varying', { name: 'equipo', nullable: true, length: 20 })
  equipo: string | null;
  @Column('boolean', { name: 'rifa', nullable: true })
  rifa: boolean | null;
  @Column('character varying', { name: 'tipo', nullable: true, length: 1 })
  tipo: string | null;
  @Column('boolean', { name: 'cupocontrol', nullable: true })
  cupocontrol: boolean | null;
  @Column('bigint', { name: 'cupomaximo', nullable: true })
  cupomaximo: number | null;
  @Column('boolean', { name: 'activo', nullable: true })
  activo: boolean | null;
  @Column('bigint', { name: 'idcampeonato', nullable: true })
  idcampeonato: number | null;
  @Column('integer', { name: 'criteriocalculoedad', nullable: true })
  criteriocalculoedad: number | null;
  @Column('boolean', { name: 'controlamenores16', nullable: true })
  controlamenores16: boolean | null;
  @Column('character varying', { name: 'emailcontacto', nullable: true, length: 200 })
  emailcontacto: string | null;
  @Column('timestamp with time zone', { name: 'fechainicio', nullable: true })
  fechainicio: Date | null;
  @Column('character varying', { name: 'zonahoraria', nullable: true, length: 100 })
  zonahoraria: string | null;
  @Column('character varying', { name: 'url', nullable: true, length: 255 })
  url: string | null;
  @Column('boolean', { name: 'externo', default: () => 'false' })
  externo: boolean;
  @Column('character varying', { name: 'clasificacion', nullable: true, length: 100 })
  clasificacion: string | null;
  @Column('character varying', { name: 'rutamapa', nullable: true, length: 100 })
  rutamapa: string | null;
  @Column('character varying', { name: 'rutaperfil', nullable: true, length: 100 })
  rutaperfil: string | null;
  @Column('character varying', { name: 'rutavideo', nullable: true, length: 300 })
  rutavideo: string | null;
  @Column('boolean', { name: 'inforepresentante', nullable: true, default: () => 'false' })
  inforepresentante: boolean | null;
  @Column('integer', { name: 'proceso', nullable: true, default: () => '1' })
  proceso: number | null;
  @Column('character varying', { name: 'mapalugar', nullable: true, length: 200 })
  mapalugar: string | null;
  @Column('integer', { name: 'registropago', nullable: true })
  registropago: number | null;
  @Column('character varying', { name: 'token', nullable: true, length: 128 })
  token: string | null;
  @Column('character varying', { name: 'etiquetacompetencias', nullable: true, length: 50 })
  etiquetacompetencias: string | null;
  @Column('character', { name: 'localidad', nullable: true, length: 200 })
  localidad: string | null;

  @ManyToOne(() => Ciudad)
  @JoinColumn([{ name: 'idciudad', referencedColumnName: 'id' }])
  ciudad: Ciudad;

  @ManyToOne(() => Estado, (estado) => estado.eventos)
  @JoinColumn([{ name: 'idestado', referencedColumnName: 'id' }])
  estado: Estado;

  @ManyToOne(() => Organizador)
  @JoinColumn([{ name: 'idorganizador', referencedColumnName: 'id' }])
  organizadorRel: Organizador;

  @OneToMany(() => Inscrito, (inscrito) => inscrito.evento)
  inscritos: Inscrito[];
}
