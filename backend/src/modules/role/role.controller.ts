import { Body, Controller } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create.role.dto';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) { }

  async createRole(@Body() createRoleDto: CreateRoleDto) {
    const result = await this.roleService.createRole(createRoleDto);

    return {
      message: 'Tạo mới Role thành công'
    }
  }
}
