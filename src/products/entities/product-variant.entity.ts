import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Stock } from './stock.entity';
import { nullableStringColumn } from '../lib/nullableStringColumn';

@Entity()
export class ProductVariant {
  constructor() {
    this.photos = [];
  }
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index({ unique: true })
  article: string;

  @Column('text', { array: true, nullable: true })
  photos: string[] | null;

  @nullableStringColumn()
  wheelDiameter: string | null;

  @nullableStringColumn()
  color: string | null;

  @nullableStringColumn()
  frameSize: string | null;

  @Column()
  price: number;

  @ManyToOne(() => Product, { cascade: true })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @OneToMany(() => Stock, (stock) => stock.productVariant)
  stockItems: Stock[];
}
