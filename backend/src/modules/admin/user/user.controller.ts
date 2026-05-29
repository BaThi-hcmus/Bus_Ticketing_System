import { Body, Controller } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create.user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  async createUser(@Body() createUserDto: CreateUserDto) {
    const result = await this.userService.createUser(createUserDto);

    return {
      data: result,
      message: 'Tạo mới tài khoản thành công'
    }
  }
}
