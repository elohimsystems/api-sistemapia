import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Evento } from '../../eventos/entities/evento.entity';
import { Ciudad } from '../../ciudades/entities/ciudad.entity';

@Index('tmestados_pkey', ['id'], { unique: true })
@Entity('tmestados', { schema: 'piaaccess' })
export class Estado {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: number;

  @Column('character varying', { name: 'nombre', nullable: true, length: 30 })
  nombre: string | null;

  @Column('bigint', { name: 'idpais', nullable: true })
  idpais: number | null;

  @OneToMany(() => Ciudad, (ciudad) => ciudad.estado)
  ciudades: Ciudad[];

  @OneToMany(() => Evento, (evento) => evento.estado)
  eventos: Evento[];
}
