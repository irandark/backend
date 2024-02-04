import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import * as XLSX from 'xlsx';

@Injectable()
export class UpdateProductsService {
  constructor(private readonly productsService: ProductsService) {}
  async readXls(file: Express.Multer.File) {
    const workbook = XLSX.read(file.buffer);
    const json = XLSX.utils.sheet_to_json(
      workbook.Sheets[workbook.SheetNames[0]],
    );

    console.log(json);

    const productsFromXsl = this.convertJsonToMap(json);

    const productsFromDb = await this.productsService.findAll();

    const matchProducts = await this.matchProducts(
      productsFromXsl,
      productsFromDb,
    );

    return this.buildResponse(matchProducts);
  }

  private convertJsonToMap(json) {
    const products = new Map<string, number>();

    json.forEach((el) => {
      products.set(el['Остатки товаров на складах'], el.__EMPTY_5);
    });

    console.log(products);

    return products;
  }

  private async matchProducts(productsFromXsl, productsFromDb) {
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
