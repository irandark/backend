import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { Category } from 'src/category/entities/category.entity';
import { Subcategory } from 'src/subcategory/entities/subcategory.entity';
import { FilterProductsDto } from './dto/filter-products.dto';
import { ProductVariant } from './entities/product-variant.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Subcategory)
    private readonly subcategoryRepository: Repository<Subcategory>,
    private dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      if (
        createProductDto.productVariants.length === 0 ||
        !createProductDto.productVariants
      ) {
        throw new BadRequestException('Product variants not found');
      }

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
            features: createProductDto.features,
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
        throw new BadRequestException(
          `Товар с именем ${createProductDto.name} занят`,
        );
      }
    } catch (error) {
      throw new BadRequestException(error.message);
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

    const safeOrderBy = this.getSafeOrderByValue(orderBy);
    orderDirection.toUpperCase();

    const query = this.productRepository
      .createQueryBuilder('product')
      .innerJoin('product.subcategories', 'subcategory')
      .innerJoin('subcategory.category', 'category')
      .where('category.id = :categoryId', { categoryId })
      .leftJoinAndSelect('product.productVariants', 'variant')
      .leftJoinAndSelect('variant.stockItems', 'stock')
      .leftJoinAndSelect('stock.warehouse', 'warehouseId');

    if (subcategoryIds && subcategoryIds.length > 0) {
      query.andWhere('subcategory.id IN (:...subcategoryIds)', {
        subcategoryIds,
      });
    }

    query.leftJoinAndSelect('product.subcategories', 'subcategories');
    query.leftJoinAndSelect('product.category', 'categoryId');

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

  async getAllProductVariants(): Promise<ProductVariant[]> {
    return await this.productVariantRepository.find();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: [
        'productVariants',
        'productVariants.stockItems',
        'subcategories',
        'category',
      ],
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
    return await this.dataSource.transaction(async (manager) => {
      const product = await manager.findOne(Product, {
        where: { id },
        relations: [
          'productVariants',
          'productVariants.stockItems',
          'subcategories',
          'category',
        ],
      });
      if (!product) {
        throw new NotFoundException(`Товар с id ${id} не найден`);
      }

      let category: Category;
      let subcategories: Subcategory[];

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

      for (const variantData of updateProductDto.productVariants) {
        const concurrencyVariant = await manager.findOne(ProductVariant, {
          where: {
            article: variantData.article,
          },
        });
        if (concurrencyVariant) {
          await manager.update(ProductVariant, concurrencyVariant.id, {
            product: product,
            article: variantData.article,
            color: variantData.color,
            frameSize: variantData.frameSize,
            wheelDiameter: variantData.wheelDiameter,
            price: variantData.price,
          });
        } else {
          const newVariant = manager.create(ProductVariant, {
            product: product,
            article: variantData.article,
            color: variantData.color,
            frameSize: variantData.frameSize,
            wheelDiameter: variantData.wheelDiameter,
            price: variantData.price,
          });
          await manager.save(newVariant);
        }
      }

      const variants = await manager.findBy(ProductVariant, {
        product: product,
      });

      for (const variant of variants) {
        if (
          !updateProductDto.productVariants.find(
            (v) => v.article === variant.article,
          )
        ) {
          await manager.remove(variant);
        }
      }

      //если артикул не менялся, то ничгео не делаем, если артикул поменялся, то необходимо обновить остатки

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
