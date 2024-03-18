import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Category } from 'src/category/entities/category.entity';
import { Subcategory } from 'src/subcategory/entities/subcategory.entity';
import { ProductVariant } from './entities/product-variant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category, Subcategory, ProductVariant]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}

//FIXME rename products to product
