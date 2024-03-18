import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductVariant } from 'src/products/entities/product-variant.entity';
import { Product } from 'src/products/entities/product.entity';
import { ProductsService } from 'src/products/products.service';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';

@Injectable()
export class WarehouseService {
  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository(Product)
    private readonly productVariantRepository: Repository<ProductVariant>,
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
    console.log(productVariantsFromDb);
    //const matchProducts = await this.matchProducts(
    //  productsFromXsl,ar
    //  productsFromDb,
    // );

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

  private async matchProducts(
    productsFromXsl: Map<string, number>,
    productsFromDb,
  ) {
    const res = {};

    for (const { article } of productsFromDb) {
      if (productsFromXsl.has(article)) {
        res[article] = productsFromXsl.get(article);
      }
    }

    return res;
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
