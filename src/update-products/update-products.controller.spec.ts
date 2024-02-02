import { Test, TestingModule } from '@nestjs/testing';
import { UpdateProductsController } from './update-products.controller';
import { UpdateProductsService } from './update-products.service';

describe('UpdateProductsController', () => {
  let controller: UpdateProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UpdateProductsController],
      providers: [UpdateProductsService],
    }).compile();

    controller = module.get<UpdateProductsController>(UpdateProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
