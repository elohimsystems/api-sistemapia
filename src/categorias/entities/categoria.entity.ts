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
import { Competencia } from '../../competencias/entities/competencia.entity';
import { Inscrito } from '../../inscritos/entities/inscrito.entity';

@Index('tmcategorias_pkey', ['id'], { unique: true })
@Entity('tmcategorias', { schema: 'piaaccess' })
export class Categoria {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: number;

  @Column('character varying', {
    name: 'descripcion',
    nullable: true,
    length: 30,
  })
  descripcion: string | null;

  @Column('bigint', { name: 'idcampeonato', nullable: true })
  idcampeonato: number | null;

  @ManyToOne(() => Competencia, (competencia) => competencia.categorias)
  @JoinColumn([{ name: 'idcompetencia', referencedColumnName: 'id' }])
  competencia: Competencia;

  @OneToMany(() => Inscrito, (inscrito) => inscrito.categoria)
  inscritos: Inscrito[];

  @RelationId((categoria: Categoria) => categoria.competencia)
  idcompetencia: number;
}
