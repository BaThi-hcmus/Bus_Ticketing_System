import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CategoryPermissionService } from './category-permission.service';
import { CreateCategoryPermissionDto } from './dto/create.category-permission.dto';
import { EditCategoryPermissionDto } from './dto/edit.category-permission.dto';

@Controller('admin/category-permission')
export class CategoryPermissionController {
  constructor(private readonly categoryPermissionService: CategoryPermissionService) { }

  @Get()
  async getPaginated(
    @Query('status') status: string,
    @Query('keyword') keyword: string,
    @Query('page') page: number,
    @Query('sortType') sortType: string
  ) {
    const result = await this.categoryPermissionService.getPaginated(status, keyword, page, sortType);
    return {
      message: 'Lấy danh mục quyền thành công',
      data: result,
    };
  }

  @Get('all')
  async getAll() {
    const result = await this.categoryPermissionService.getAll();
    return {
      message: 'Lấy tất cả danh mục quyền thành công',
      data: result
    }
  }

  @Post('create')
  async create(@Body() createDto: CreateCategoryPermissionDto) {
    const result = await this.categoryPermissionService.create(createDto);
    return {
      message: 'Tạo mới danh mục quyền thành công',
      data: result
    }
  }

  @Patch('edit/:id')
  async update(@Param('id') id: number, @Body() editDto: EditCategoryPermissionDto) {
    const result = await this.categoryPermissionService.update(id, editDto);
    return {
      message: 'Chỉnh sửa danh mục quyền thành công',
      data: result
    }
  }

  @Get('detail/:id')
  async getDetail(@Param('id') id: number) {
    const result = await this.categoryPermissionService.getDetail(id);
    return {
      message: 'Lấy chi tiết danh mục quyền thành công',
      data: result
    }
  }
}
