import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Categoria } from '../../categorias/entities/categoria.entity';
import { Inscrito } from '../../inscritos/entities/inscrito.entity';

@Index('tmcompetencias_pkey', ['id'], { unique: true })
@Entity('tmcompetencias', { schema: 'piaaccess' })
export class Competencia {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: number;

  @Column('bigint', { name: 'idevento', nullable: true })
  idevento: number | null;

  @Column('character varying', {
    name: 'descripcion',
    nullable: true,
    length: 30,
  })
  descripcion: string | null;

  @Column('timestamp without time zone', {
    name: 'fechacierre',
    nullable: true,
  })
  fechacierre: Date | null;

  @Column('timestamp without time zone', { name: 'horacierre', nullable: true })
  horacierre: Date | null;

  @Column('bigint', { name: 'cupomaximo', nullable: true })
  cupomaximo: number | null;

  @Column('bigint', { name: 'tipoinscripcion', nullable: true })
  tipoinscripcion: number | null;

  @OneToMany(() => Inscrito, (inscrito) => inscrito.competencia)
  inscritos: Inscrito[];

  @OneToMany(() => Categoria, (categoria) => categoria.competencia)
  categorias: Categoria[];
}
