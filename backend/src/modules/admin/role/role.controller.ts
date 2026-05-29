import { Body, Controller, Get, Post } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create.role.dto';

@Controller('admin/role')
export class RoleController {
  constructor(private readonly roleService: RoleService) { }

  @Get()
  async getRoles() {
    const result = await this.roleService.getRoles();

    return {
      data: result,
      message: 'Lấy roles thành công'
    }
  }

  @Post('create')
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    const result = await this.roleService.createRole(createRoleDto);

    return {
      message: 'Tạo mới Role thành công'
    }
  }
}
