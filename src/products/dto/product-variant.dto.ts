import { IsArray, IsNumber, IsString } from 'class-validator';

export class ProductVariantDto {
  @IsString()
  article: string;

  @IsString()
  wheelDiameter: string;

  @IsString()
  color: string;

  @IsString()
  frameSize: string;

  @IsNumber()
  price: number;
}
