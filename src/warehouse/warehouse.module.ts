import { Module } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { WarehouseController } from './warehouse.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/category/entities/category.entity';
import { Product } from 'src/products/entities/product.entity';
import { Subcategory } from 'src/subcategory/entities/subcategory.entity';
import { ProductsService } from 'src/products/products.service';
import { ProductVariant } from 'src/products/entities/product-variant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category, Subcategory, ProductVariant]),
  ],
  controllers: [WarehouseController],
  providers: [WarehouseService, ProductsService],
})
export class WarehouseModule {}
