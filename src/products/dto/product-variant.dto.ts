import { IsArray, IsNumber, IsString } from 'class-validator';

export class ProductVariantDto {
  constructor() {
    this.photos = [];
  }

  @IsString()
  article: string;

  @IsArray()
  photos: string[];

  @IsString()
  wheelDiameter: string;

  @IsString()
  color: string;

  @IsString()
  frameSize: string;

  @IsNumber()
  price: number;
}
