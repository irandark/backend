import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { In, Repository } from 'typeorm';
import { Category } from 'src/category/entities/category.entity';
import { Subcategory } from 'src/subcategory/entities/subcategory.entity';
import { FilterProductsDto } from './dto/filter-products.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Subcategory)
    private readonly subcategoryRepository: Repository<Subcategory>,
  ) {}

  async create(createProductDto: CreateProductDto) {
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

      const product = this.productRepository.create({
        article: createProductDto.article,
        name: createProductDto.name,
        price: createProductDto.price,
        subcategories,
        category,
      });

      await this.productRepository.save(product);

      return product;
    } catch (error) {
      throw new BadRequestException(error);
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
    const query = this.productRepository
      .createQueryBuilder('product')
      .innerJoin('product.subcategories', 'subcategory')
      .innerJoin('subcategory.category', 'category')
      .where('category.id = :categoryId', { categoryId });

    if (subcategoryIds && subcategoryIds.length > 0) {
      query.andWhere('subcategory.id IN (:...subcategoryIds)', {
        subcategoryIds,
      });
    }

    query.orderBy(`product.${orderBy}`, orderDirection);

    return query.getMany();
  }

  async findAll(): Promise<Product[]> {
    return await this.productRepository.find();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    await this.productRepository.update(id, updateProductDto);
    return await this.productRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    await this.productRepository.delete(id);
  }
}
