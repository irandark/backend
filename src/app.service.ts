import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Category } from './category/entities/category.entity';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { Warehouse } from './warehouse/entities/warehouse.entity';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,

    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,

    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async onModuleInit() {
    await this.createInitialCategories();
  }
  private async createInitialCategories() {
    const initialCategories = [{ name: 'Велосипеды' }, { name: 'Аксесуары' }];
    const initialWarehouses = [
      { name: 'Очаково', id: 1 },
      { name: 'Янгеля', id: 2 },
      { name: 'Ногинск', id: 3 },
      { name: 'Томилино Матрица', id: 4 },
      { name: 'Томилино Вело', id: 5 },
      { name: 'Общее количество', id: 6 },
    ];

    await this.saveInitialColumns(initialCategories, this.categoryRepository);
    await this.saveInitialColumns(initialWarehouses, this.warehouseRepository);
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
        const sequences = await queryRunner.manager.query(`
        SELECT 'SELECT SETVAL(' ||
               quote_literal(quote_ident(PGT.schemaname) || '.' || quote_ident(S.relname)) ||
               ', COALESCE(MAX(' || quote_ident(C.attname) || '), 1), false) FROM ' ||
               quote_ident(PGT.schemaname) || '.' || quote_ident(T.relname) || ';'
        FROM pg_class AS S,
             pg_depend AS D,
             pg_class AS T,
             pg_attribute AS C,
             pg_tables AS PGT
        WHERE S.relkind = 'S'
          AND S.oid = D.objid
          AND D.refobjid = T.oid
          AND D.refobjid = C.attrelid
          AND D.refobjsubid = C.attnum
          AND T.relname = PGT.tablename
          AND S.relname NOT LIKE 'pg_%';
      `);

        for (const seq of sequences) {
          await queryRunner.manager.query(seq['?column?']);
        }
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async saveInitialColumns<T extends { name: string }>(
    initialColumns: T[],
    repository: Repository<T>,
  ) {
    const savePromises = initialColumns.map(async (data) => {
      const exist = await repository.findOne({
        where: { name: data.name } as FindOptionsWhere<T>,
      });
      if (!exist) {
        return repository.save(data);
      }
    });
    try {
      await Promise.all(savePromises);
    } catch (error) {
      console.log(error);
    }
  }
}
