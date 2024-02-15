import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { ProductVariantDto } from './product-variant.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  productVariantId?: number;
  productVariant?: ProductVariantDto;
}
