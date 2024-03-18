import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Category } from 'src/category/entities/category.entity';
import { Subcategory } from 'src/subcategory/entities/subcategory.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { Warehouse } from '../warehouse/entities/warehouse.entity';
import { Stock } from '../warehouse/entities/stock.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Category,
      Subcategory,
      ProductVariant,
      Warehouse,
      Stock,
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}

//FIXME rename products to product
