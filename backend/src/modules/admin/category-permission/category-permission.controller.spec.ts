import { Test, TestingModule } from '@nestjs/testing';
import { CategoryPermissionController } from './category-permission.controller';
import { CategoryPermissionService } from './category-permission.service';

describe('CategoryPermissionController', () => {
  let controller: CategoryPermissionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryPermissionController],
      providers: [CategoryPermissionService],
    }).compile();

    controller = module.get<CategoryPermissionController>(CategoryPermissionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
