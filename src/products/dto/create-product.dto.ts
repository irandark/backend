import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ProductVariantDto } from './product-variant.dto';
import { StockInfoDto } from './stock-info.dto';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  subcategoryIds: number[];

  @IsNumber()
  categoryId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  brand: string;

  @IsString()
  frameMaterial: string;

  @IsNumber()
  modelYear: number;

  @IsString()
  forkType: string;

  @IsString()
  forkName: string;

  @IsString()
  numberOfSpeeds: string;

  @IsString()
  rearDerailleur: string;

  @IsString()
  frontDerailleur: string;

  @IsString()
  shifters: string;

  @IsString()
  system: string;

  @IsString()
  cassette: string;

  @IsString()
  brakeType: string;

  @IsString()
  brakeName: string;

  @IsNumber()
  weight: number;

  @IsArray()
  @ValidateNested()
  @Type(() => ProductVariantDto)
  productVariants: ProductVariantDto[];
}
