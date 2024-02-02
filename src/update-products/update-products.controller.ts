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
import { UpdateProductsService } from './update-products.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('update-products')
export class UpdateProductsController {
  constructor(private readonly updateProductsService: UpdateProductsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async readXls(@UploadedFile() file: Express.Multer.File, @Body() data) {
    return await this.updateProductsService.readXls(file);
  }
}
