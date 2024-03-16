import { Category } from 'src/category/entities/category.entity';
import { Product } from 'src/products/entities/product.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Subcategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToOne(() => Category, (category) => category.subcategories)
  category: Category;

  @ManyToMany(() => Product, (product) => product.subcategories, {
    onDelete: 'CASCADE',
  })
  products: Product[];
}
