import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Category } from './category/entities/category.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,

    @InjectDataSource()
    private dataSource: DataSource,
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

  async resetDatabase() {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entities = this.dataSource.entityMetadatas;

      for (const entity of entities) {
        const tableName = entity.tableName;

        await queryRunner.manager.query(
          `TRUNCATE TABLE "${tableName}" CASCADE;`,
        );
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
