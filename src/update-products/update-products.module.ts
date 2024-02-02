import { Module } from '@nestjs/common';
import { UpdateProductsService } from './update-products.service';
import { UpdateProductsController } from './update-products.controller';
import { ProductsService } from 'src/products/products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [UpdateProductsController],
  providers: [UpdateProductsService, ProductsService],
})
export class UpdateProductsModule {}
