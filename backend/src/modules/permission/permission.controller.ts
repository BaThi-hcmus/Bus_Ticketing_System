import { Body, Controller, Get, Post } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create.permission.dto';

@Controller('admin/permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) { }

  @Get()
  async getPermissions() {
    const result = await this.permissionService.getPermissions();

    return {
      data: result,
      message: 'Lấy permissions thành công'
    }
  }

  @Post('create')
  async createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    const result = await this.permissionService.createPermission(createPermissionDto);

    return {
      message: 'Tạo mới quyền thành công'
    }
  }
}
