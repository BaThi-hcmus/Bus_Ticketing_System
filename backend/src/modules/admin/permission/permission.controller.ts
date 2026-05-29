import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create.permission.dto';
import { EditPermissionDto } from './dto/edit.permission.dto';

@Controller('admin/permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) { }

  @Get()
  async getPermissions(
    @Query('status') status: string,
    @Query('keyword') keyword: string,
    @Query('page') page: number,
    @Query('sortType') sortType: string
  ) {
    const result = await this.permissionService.getPermissions(status, keyword, page, sortType);

    return {
      message: 'Lấy permissions thành công',
      data: result
    }
  }

  @Post('create')
  async createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    const result = await this.permissionService.createPermission(createPermissionDto);

    return {
      message: 'Tạo mới quyền thành công',
      data: result
    }
  }

  @Patch('edit/:id')
  async editPermission(@Param('id') id: number, @Body() editPermissionDto: EditPermissionDto) {
    const result = await this.permissionService.editPermission(id, editPermissionDto);

    return {
      message: 'Chỉnh sửa quyền thành công',
      data: result
    }
  }

  @Get('detail/:id')
  async getPermissionDetail(@Param('id') id: number) {
    const result = await this.permissionService.getPermissionDetail(id);

    return {
      message: 'Lấy thông tin chi tiết quyền thành công',
      data: result
    }
  }
}

