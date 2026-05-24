import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { Competidor } from '../../competidores/entities/competidore.entity';
import { Categoria } from '../../categorias/entities/categoria.entity';
import { Competencia } from '../../competencias/entities/competencia.entity';
import { Evento } from '../../eventos/entities/evento.entity';
import { Pago } from '../../pagos/entities/pago.entity';

@Index('tminscritos_pkey', ['id'], { unique: true })
@Entity('tminscritos', { schema: 'piaaccess' })
export class Inscrito {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: string;

  @Column('integer', { name: 'numero', nullable: true })
  numero: number | null;

  @Column('timestamp without time zone', { name: 'fechahora', nullable: true })
  fechahora: Date | null;

  @Column('character varying', { name: 'punto', nullable: true, length: 30 })
  punto: string | null;

  @Column('character varying', { name: 'equipo', nullable: true, length: 30 })
  equipo: string | null;

  @Column('real', { name: 'precio', nullable: true, precision: 24 })
  precio: number | null;

  @Column('integer', { name: 'status', nullable: true })
  status: number | null;

  @Column('integer', { name: 'publicado', nullable: true })
  publicado: number | null;

  @Column('bigint', { name: 'secuencia', nullable: true })
  secuencia: string | null;

  @Column('boolean', { name: 'notificado', nullable: true })
  notificado: boolean | null;

  @Column('character varying', { name: 'idgrupo', nullable: true, length: 100 })
  idgrupo: string | null;

  @ManyToOne(() => Competidor, (competidor) => competidor.inscritos)
  @JoinColumn([{ name: 'idpia', referencedColumnName: 'id' }])
  competidor: Competidor;

  @ManyToOne(() => Categoria, (categoria) => categoria.inscritos)
  @JoinColumn([{ name: 'idcategoria', referencedColumnName: 'id' }])
  categoria: Categoria;

  @OneToMany(() => Pago, (pago) => pago.inscrito)
  pagos: Pago[];

  @ManyToOne(() => Competencia, (competencia) => competencia.inscritos)
  @JoinColumn([{ name: 'idcompetencia', referencedColumnName: 'id' }])
  competencia: Competencia;

  @ManyToOne(() => Evento, (evento) => evento.inscritos)
  @JoinColumn([{ name: 'idevento', referencedColumnName: 'id' }])
  evento: Evento;

  @RelationId((inscrito: Inscrito) => inscrito.competidor)
  idpia: string;

  @RelationId((inscrito: Inscrito) => inscrito.categoria)
  idcategoria: string;

  @RelationId((inscrito: Inscrito) => inscrito.competencia)
  idcompetencia: string;

  @RelationId((inscrito: Inscrito) => inscrito.evento)
  idevento: string;
}
