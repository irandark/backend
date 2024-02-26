import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { DataSource, In, Repository, getConnection, getManager } from 'typeorm';
import { Category } from 'src/category/entities/category.entity';
import { Subcategory } from 'src/subcategory/entities/subcategory.entity';
import { FilterProductsDto } from './dto/filter-products.dto';
import { ProductVariant } from './entities/product-variant.entity';
import { Stock } from './entities/stock.entity';
import { Warehouse } from './entities/warehouse.entity';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Product)
    private readonly productVariantRepository: Repository<ProductVariant>,
    @InjectRepository(Product)
    private readonly stockRepository: Repository<Stock>,
    @InjectRepository(Product)
    private readonly warehouseRepository: Repository<Warehouse>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Subcategory)
    private readonly subcategoryRepository: Repository<Subcategory>,
    private dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto) {
    console.log(createProductDto);
    try {
      const category = await this.categoryRepository.findOneBy({
        id: createProductDto.categoryId,
      });
      if (!category) {
        throw new BadRequestException(
          `Category with id ${createProductDto.categoryId} not found`,
        );
      }

      const subcategories = await this.subcategoryRepository
        .createQueryBuilder('subcategory')
        .where('subcategory.id IN (:...subcategoryIds)', {
          subcategoryIds: createProductDto.subcategoryIds,
        })
        .getMany();

      if (!subcategories) {
        throw new BadRequestException(
          `Subcategory with id ${createProductDto.subcategoryIds} not found`,
        );
      }

      const product = await this.productRepository.findOne({
        where: {
          name: createProductDto.name,
        },
      });

      if (!product) {
        await this.dataSource.transaction(async (manager) => {
          const product = manager.create(Product, {
            name: createProductDto.name,
            brand: createProductDto.brand,
            frameMaterial: createProductDto.frameMaterial,
            modelYear: createProductDto.modelYear,
            forkType: createProductDto.forkType,
            forkName: createProductDto.forkName,
            numberOfSpeeds: createProductDto.numberOfSpeeds,
            rearDerailleur: createProductDto.rearDerailleur,
            frontDerailleur: createProductDto.frontDerailleur,
            shifters: createProductDto.shifters,
            system: createProductDto.system,
            cassette: createProductDto.cassette,
            brakeType: createProductDto.brakeType,
            brakeName: createProductDto.brakeName,
            weight: createProductDto.weight,
            imageUrl: createProductDto.imageUrl,
            category: category,
            subcategories: subcategories,
          });

          await manager.save(product);

          for (const variantData of createProductDto.productVariants) {
            const variant = manager.create(ProductVariant, {
              product: product,
              article: variantData.article,
              color: variantData.color,
              frameSize: variantData.frameSize,
              wheelDiameter: variantData.wheelDiameter,
              price: variantData.price,
            });

            await manager.save(variant);
          }
        });
      } else {
      }
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.detail);
    }
  }

  async getProductsByCategoryAndSubcategory(
    filterDto: FilterProductsDto,
  ): Promise<Product[]> {
    const {
      categoryId,
      subcategoryIds,
      orderBy = 'price',
      orderDirection = 'ASC',
    } = filterDto;

    console.log(filterDto);

    const safeOrderBy = this.getSafeOrderByValue(orderBy);
    orderDirection.toUpperCase();

    const query = this.productRepository
      .createQueryBuilder('product')
      .innerJoin('product.subcategories', 'subcategory')
      .innerJoin('subcategory.category', 'category')
      .where('category.id = :categoryId', { categoryId })
      .leftJoinAndSelect('product.productVariants', 'variant')
      .leftJoinAndSelect('variant.stockItems', 'stock');

    if (subcategoryIds && subcategoryIds.length > 0) {
      query.andWhere('subcategory.id IN (:...subcategoryIds)', {
        subcategoryIds,
      });
    }

    query.orderBy(`variant.${safeOrderBy}`, orderDirection);

    return query.getMany();
  }

  private getSafeOrderByValue(orderBy: string): string {
    const allowedFields = ['price'];

    if (allowedFields.includes(orderBy)) {
      return orderBy;
    }

    throw new BadRequestException('Неправильно заполнено поле orderBy');
  }

  async findAll(): Promise<Product[]> {
    return await this.productRepository.find({
      relations: ['productVariants', 'productVariants.stockItems'],
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['productVariants', 'productVariants.stockItems'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async getProductsByName(name: string): Promise<Product[]> {
    return await this.productRepository.findBy({ name });
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    console.log(updateProductDto);
    return await this.dataSource.transaction(async (manager) => {
      const product = await manager.findOne(Product, { where: { id } });
      if (!product) {
        throw new NotFoundException(`Товар с id ${id} не найден`);
      }

      let category: Category, subcategories: Subcategory[];

      if (updateProductDto.categoryId) {
        category = await manager.findOne(Category, {
          where: { id: updateProductDto.categoryId },
        });

        if (!category) {
          throw new NotFoundException(`Категория с id ${id} не найдена`);
        }
      }

      if (
        updateProductDto.subcategoryIds &&
        updateProductDto.subcategoryIds.length > 0
      ) {
        subcategories = await this.subcategoryRepository
          .createQueryBuilder('subcategory')
          .where('subcategory.id IN (:...subcategoryIds)', {
            subcategoryIds: updateProductDto.subcategoryIds,
          })
          .getMany();
      }

      product.brakeName = updateProductDto.brakeName;
      product.brakeType = updateProductDto.brakeType;
      product.cassette = updateProductDto.cassette;
      product.forkName = updateProductDto.forkName;
      product.forkType = updateProductDto.forkType;
      product.frameMaterial = updateProductDto.frameMaterial;
      product.frontDerailleur = updateProductDto.frontDerailleur;
      product.modelYear = updateProductDto.modelYear;
      product.numberOfSpeeds = updateProductDto.numberOfSpeeds;
      product.rearDerailleur = updateProductDto.rearDerailleur;
      product.shifters = updateProductDto.shifters;
      product.system = updateProductDto.system;
      product.weight = updateProductDto.weight;
      product.subcategories = subcategories;
      product.category = category;
      product.brand = updateProductDto.brand;
      product.name = updateProductDto.name;
      product.imageUrl = updateProductDto.imageUrl;

      await manager.save(product);

      console.log(updateProductDto);

      const productVariant = await manager.findOne(ProductVariant, {
        where: { id: updateProductDto.productVariantId },
      });

      if (!productVariant) {
        throw new NotFoundException(`ProductVariant с id ${id} не найден`);
      }

      productVariant.color = updateProductDto.productVariant.color;
      productVariant.frameSize = updateProductDto.productVariant.frameSize;
      productVariant.wheelDiameter =
        updateProductDto.productVariant.wheelDiameter;
      productVariant.price = updateProductDto.productVariant.price;

      await manager.save(productVariant);

      return product;
    });
  }

  async remove(id: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    await this.productRepository.delete(id);
  }
}
