import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { Inscrito } from '../../inscritos/entities/inscrito.entity';

@Index('tmpagos_pkey', ['id'], { unique: true })
@Entity('tmpagos', { schema: 'piaaccess' })
export class Pago {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: number;

  @Column('timestamp without time zone', { name: 'fechahora', nullable: true })
  fechahora: Date | null;

  @Column('double precision', { name: 'monto', nullable: true, precision: 53 })
  monto: number | null;

  @Column('character varying', { name: 'moneda', nullable: true, length: 3 })
  moneda: string | null;

  @Column('character varying', {
    name: 'referencia',
    nullable: true,
    length: 20,
  })
  referencia: string | null;

  @Column('character varying', {
    name: 'comprobante',
    nullable: true,
    length: 200,
  })
  comprobante: string | null;

  @Column('character varying', { name: 'tipo', nullable: true, length: 20 })
  tipo: string | null;

  @Column('character varying', { name: 'banco', nullable: true, length: 50 })
  banco: string | null;

  @Column('boolean', { name: 'conciliado', nullable: true })
  conciliado: boolean | null;

  @Column('timestamp without time zone', {
    name: 'conciliadoel',
    nullable: true,
  })
  conciliadoel: Date | null;

  @Column('bigint', { name: 'idliquidacion', nullable: true })
  idliquidacion: number | null;

  @Column('timestamp without time zone', { name: 'notificado', nullable: true })
  notificado: Date | null;

  @Column('character varying', { name: 'texto', nullable: true, length: 100 })
  texto: string | null;

  @Column('character varying', {
    name: 'idpagador',
    nullable: true,
    length: 20,
  })
  idpagador: string | null;

  @Column('character varying', {
    name: 'nombrepagador',
    nullable: true,
    length: 100,
  })
  nombrepagador: string | null;

  @Column('character varying', {
    name: 'correopagador',
    nullable: true,
    length: 255,
  })
  correopagador: string | null;

  @Column('date', { name: 'fechapago', nullable: true })
  fechapago: Date | null;

  @Column('double precision', { name: 'precio', nullable: true, precision: 53 })
  precio: number | null;

  @Column('double precision', {
    name: 'recargas',
    nullable: true,
    precision: 53,
  })
  recargas: number | null;

  @ManyToOne(() => Inscrito, (inscrito) => inscrito.pagos)
  @JoinColumn([{ name: 'idinscrito', referencedColumnName: 'id' }])
  inscrito: Inscrito;

  @Column('bigint', { name: 'idmoneda', nullable: true })
  idmoneda: number | null;

  @Column('bigint', { name: 'idbanco', nullable: true })
  idbanco: number | null;

  @Column('bigint', { name: 'idformapago', nullable: true })
  idformapago: number | null;

  @RelationId((pago: Pago) => pago.inscrito)
  idinscrito: string;
}
