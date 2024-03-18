import { Product } from '../entities/product.entity';
import { Stock } from '../../warehouse/entities/stock.entity';

export class UpdateProductVariantDto {
  price: number;
  wheelDiameter: string;
  color: string;
  frameSize: string;
  product: Product;
  stockItems: Stock[];
}
