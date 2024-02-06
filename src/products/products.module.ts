import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Category } from 'src/category/entities/category.entity';
import { Subcategory } from 'src/subcategory/entities/subcategory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category, Subcategory])],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}

//FIXME rename products to product
