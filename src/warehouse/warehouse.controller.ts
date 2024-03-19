import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post('update-stock')
  @UseInterceptors(FileInterceptor('file'))
  async updatingStockViaExcel(@UploadedFile() file: Express.Multer.File) {
    return await this.warehouseService.updatingStockViaExcel(file);
  }
}
