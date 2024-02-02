import { Test, TestingModule } from '@nestjs/testing';
import { UpdateProductsService } from './update-products.service';

describe('UpdateProductsService', () => {
  let service: UpdateProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UpdateProductsService],
    }).compile();

    service = module.get<UpdateProductsService>(UpdateProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
