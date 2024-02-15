import { IsNumber, IsString } from 'class-validator';

export class StockInfoDto {
  @IsNumber()
  warehouseId: number;

  @IsString()
  warehouseName: string;

  @IsNumber()
  quantity: number;
}
