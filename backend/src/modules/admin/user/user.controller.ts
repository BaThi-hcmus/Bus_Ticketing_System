import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create.user.dto';
import { EditUserDto } from './dto/edit.user.dto';

@Controller('admin/user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get()
  async getUsers(@Query() query: any) {
    const data = await this.userService.getUsers(query);
    return {
      message: 'Lấy users thành công',
      data: data
    };
  }

  @Get('detail/:id')
  async getUserDetail(@Param('id') id: string) {
    const result = await this.userService.getUserDetail(Number(id));
    return {
      message: 'Lấy thông tin chi tiết User thành công',
      data: result
    };
  }

  @Post('create')
  async createUser(@Body() createUserDto: CreateUserDto) {
    const result = await this.userService.createUser(createUserDto);

    return {
      data: result,
      message: 'Tạo mới tài khoản thành công'
    }
  }

  @Patch('edit/:id')
  async updateUser(@Param('id') id: string, @Body() editUserDto: EditUserDto) {
    await this.userService.updateUser(Number(id), editUserDto);
    return {
      message: 'Cập nhật tài khoản thành công'
    };
  }
}

