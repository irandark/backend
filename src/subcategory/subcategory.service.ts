import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Subcategory } from './entities/subcategory.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SubcategoryService {
  constructor(
    @InjectRepository(Subcategory)
    private readonly subcategoryRepository: Repository<Subcategory>,
  ) {}

  async create(createSubcategoryDto: CreateSubcategoryDto) {
    try {
      const subcategory =
        this.subcategoryRepository.create(createSubcategoryDto);
      return await this.subcategoryRepository.save(subcategory);
    } catch (error) {
      throw new BadRequestException('subcategory already exists');
    }
  }

  async findAll(): Promise<Subcategory[]> {
    return await this.subcategoryRepository.find();
  }

  async getSubcategoriesByCategoryId(id: number): Promise<Subcategory[]> {
    return await this.subcategoryRepository.find({
      where: { category: { id } },
    });
  }

  async findOne(id: number): Promise<Subcategory> {
    const subcategory = await this.subcategoryRepository.findOne({
      where: { id },
    });

    if (!subcategory) {
      throw new BadRequestException('subcategory not found');
    }

    return subcategory;
  }

  async update(
    id: number,
    updateSubcategoryDto: UpdateSubcategoryDto,
  ): Promise<Subcategory> {
    await this.subcategoryRepository.update(id, updateSubcategoryDto);
    return await this.subcategoryRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    const subcategory = await this.subcategoryRepository.findOne({
      where: { id },
    });

    if (!subcategory) {
      throw new BadRequestException('subcategory not found');
    }

    await this.subcategoryRepository.delete(id);
  }
}
