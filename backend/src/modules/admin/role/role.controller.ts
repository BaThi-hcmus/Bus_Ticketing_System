import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create.role.dto';
import { EditRoleDto } from './dto/edit.role.dto';
import { CustomJwtGuard } from 'src/common/guard/jwt.guard';
import { RequiredPermission } from 'src/common/decorator/permission.decorator';
import { PermissionGuard } from 'src/common/guard/permission.guard';

@Controller('admin/role')
export class RoleController {
  constructor(
    private readonly roleService: RoleService,
  ) { }

  @Get()
  // @UseGuards(CustomJwtGuard, PermissionGuard)
  // @RequiredPermission('role:view')
  async getRoles(
    @Query('status') status: string,
    @Query('keyword') keyword: string,
    @Query('page') page: number,
    @Query('sortType') sortType: string
  ) {
    const result = await this.roleService.getRoles(status, keyword, page, sortType);

    return {
      message: 'Lấy roles thành công',
      data: result
    }
  }

  @Get('all')
  async getAllRoles() {
    const result = await this.roleService.getAllRoles();
    return {
      message: 'Lấy tất cả roles thành công',
      data: result
    }
  }

  @Post('create')
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    const result = await this.roleService.createRole(createRoleDto);

    return {
      message: 'Tạo mới Role thành công',
      data: result
    }
  }

  @Patch('edit/:id')
  async editRole(@Param('id') id: number, @Body() editRoleDto: EditRoleDto) {
    const result = await this.roleService.editRole(id, editRoleDto);

    return {
      message: 'Chỉnh sửa Role thành công',
      data: result
    }
  }

  @Get('detail/:id')
  async getRoleDetail(@Param('id') id: number) {
    const result = await this.roleService.getRoleDetail(id);

    return {
      message: 'Lấy thông tin chi tiết Role thành công',
      data: result
    }
  }
}

