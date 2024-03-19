import {
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Stock } from './stock.entity';

@Entity()
export class Warehouse {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Stock, (stock) => stock.warehouse)
  stockItems: Stock[];
}
