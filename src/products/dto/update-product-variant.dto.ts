import { Product } from '../entities/product.entity';
import { Stock } from '../entities/stock.entity';

export class UpdateProductVariantDto {
  price: number;
  wheelDiameter: string;
  color: string;
  frameSize: string;
  product: Product;
  stockItems: Stock[];
}
