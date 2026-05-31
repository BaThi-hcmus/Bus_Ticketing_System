import { Test, TestingModule } from '@nestjs/testing';
import { CategoryPermissionService } from './category-permission.service';

describe('CategoryPermissionService', () => {
  let service: CategoryPermissionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryPermissionService],
    }).compile();

    service = module.get<CategoryPermissionService>(CategoryPermissionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
