import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './category/entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async onModuleInit() {
    await this.createInitialCategories();
  }

  private async createInitialCategories() {
    const initialCategories = [{ name: 'Велосипеды' }, { name: 'Аксесуары' }];

    initialCategories.forEach(async (categoryData) => {
      const categoryExists = await this.categoryRepository.findOne({
        where: { name: categoryData.name },
      });

      if (!categoryExists) {
        await this.categoryRepository.save(categoryData);
      }
    });
  }
}
