import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SubcategoryService } from './subcategory.service';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';

@Controller('subcategory')
export class SubcategoryController {
  constructor(private readonly subcategoryService: SubcategoryService) {}

  @Post()
  async create(@Body() createSubcategoryDto: CreateSubcategoryDto) {
    return await this.subcategoryService.create(createSubcategoryDto);
  }

  @Get()
  async findAll() {
    return await this.subcategoryService.findAll();
  }

  @Get('category/:id')
  async getSubcategoriesByCategoryId(@Param('id') id: string) {
    return await this.subcategoryService.getSubcategoriesByCategoryId(+id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.subcategoryService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSubcategoryDto: UpdateSubcategoryDto,
  ) {
    return await this.subcategoryService.update(+id, updateSubcategoryDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.subcategoryService.remove(+id);
  }
}
