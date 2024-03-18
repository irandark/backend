import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductVariant } from 'src/products/entities/product-variant.entity';
import { Product } from 'src/products/entities/product.entity';
import { ProductsService } from 'src/products/products.service';
import { DataSource, Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { Stock } from './entities/stock.entity';

@Injectable()
export class WarehouseService {
  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository(Product)
    private readonly productVariantRepository: Repository<ProductVariant>,
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
    private dataSource: DataSource,
  ) {}
  async updatingStockViaExcel(file: Express.Multer.File) {
    const workbook = XLSX.read(file.buffer);
    const json: unknown[] = XLSX.utils.sheet_to_json(
      workbook.Sheets[workbook.SheetNames[0]],
    );

    //console.log(json);

    const stockInfoFromXls = this.convertJsonToMap(json);
    //console.log(stockInfoFromXls);

    const productVariantsFromDb =
      await this.productsService.getAllProductVariants();
    //console.log(productVariantsFromDb);
    const resultMatchArticles = await this.matchArticles(
      stockInfoFromXls,
      productVariantsFromDb,
    );

    await this.updateStock(resultMatchArticles);

    // return this.buildResponse(matchProducts);
  }

  private convertJsonToMap(json: unknown[]) {
    const stockInfo = new Map<
      string,
      {
        warehouseId: number;
        quantity: number;
      }[]
    >();

    json.forEach((el) => {
      const article = el['Остатки товаров на складах'];
      const warehouses = [];

      for (let i = 1; i < 7; i++) {
        warehouses.push({
          warehouseId: i,
          quantity: el[`__EMPTY_${i}`] || 0,
        });
      }

      stockInfo.set(article, warehouses);
    });

    return stockInfo;
  }

  private async matchArticles(
    stockInfoFromXls: any,
    productVariantsFromDb: any,
  ) {
    const res = [];

    for (const { article } of productVariantsFromDb) {
      if (stockInfoFromXls.has(article)) {
        res.push({
          article,
          stockInfo: stockInfoFromXls.get(article),
        });
      }
    }

    return res;
  }

  private async updateStock(resultMatchArticles: any) {
    //console.log(resultMatchArticles);

    await this.dataSource.transaction(async (manager) => {
      resultMatchArticles.forEach(({ article, stockInfo }) => {
        /*  const busyStockItem = this.stockRepository.findOne({
          where: { productVariant: { article } },
        }); */
        for (const { warehouseId, quantity } of stockInfo) {
          manager.save(
            this.stockRepository.create({
              productVariant: { article },
              quantity,
              warehouse: { id: warehouseId },
            }),
          );
        }
      });
    });
  }

  private async buildResponse(matchProducts) {
    try {
      return JSON.stringify(matchProducts);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Products not found');
      }
    }
  }
}
