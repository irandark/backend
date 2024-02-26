import { Category } from 'src/category/entities/category.entity';
import { Subcategory } from 'src/subcategory/entities/subcategory.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  ManyToOne,
  JoinColumn,
  OneToMany,
  JoinTable,
} from 'typeorm';
import { ProductVariant } from './product-variant.entity';
import { nullableStringColumn } from '../lib/nullableStringColumn';
import { nullableNumberColumn } from '../lib/nullableNumberColumn';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => Subcategory, (subcategory) => subcategory.products)
  @JoinTable({
    name: 'product_subcategory',
    joinColumn: {
      name: 'product_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'subcategory_id',
      referencedColumnName: 'id',
    },
  })
  subcategories: Subcategory[];

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @OneToMany(() => ProductVariant, (variant) => variant.product)
  productVariants: ProductVariant[];

  @nullableStringColumn()
  name: string | null;

  @nullableStringColumn()
  brand: string | null;

  @nullableStringColumn()
  frameMaterial: string | null;

  @nullableNumberColumn()
  modelYear: number | null;

  @nullableStringColumn()
  forkType: string | null;

  @nullableStringColumn()
  forkName: string | null;

  @nullableStringColumn()
  numberOfSpeeds: string | null;

  @nullableStringColumn()
  rearDerailleur: string | null;

  @nullableStringColumn()
  frontDerailleur: string | null;

  @nullableStringColumn()
  shifters: string | null;

  @nullableStringColumn()
  system: string | null;

  @nullableStringColumn()
  cassette: string | null;

  @nullableStringColumn()
  brakeType: string | null;

  @nullableStringColumn()
  brakeName: string | null;

  @nullableNumberColumn()
  weight: number | null;

  @nullableStringColumn()
  features: string | null;

  @nullableStringColumn()
  imageUrl: string | null;
}
