import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Estado } from '../../estados/entities/estado.entity';

@Index('tmciudades_pkey', ['id'], { unique: true })
@Entity('tmciudades', { schema: 'piaaccess' })
export class Ciudad {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('character varying', { name: 'nombre', nullable: true, length: 100 })
  nombre: string | null;

  @ManyToOne(() => Estado, (estado) => estado.ciudades)
  @JoinColumn([{ name: 'idestado', referencedColumnName: 'id' }])
  estado: Estado;
}
