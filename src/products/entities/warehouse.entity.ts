import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Stock } from './stock.entity';

@Entity()
export class Warehouse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Stock, (stock) => stock.warehouse)
  stockItems: Stock[];
}
