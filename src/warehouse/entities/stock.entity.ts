import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductVariant } from '../../products/entities/product-variant.entity';
import { Warehouse } from './warehouse.entity';

@Entity()
export class Stock {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => ProductVariant,
    (productVariant) => productVariant.stockItems,
  )
  @JoinColumn({
    name: 'productVariantArticle',
    referencedColumnName: 'article',
  })
  productVariant: ProductVariant;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.stockItems)
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

  @Column()
  quantity: number;
}
