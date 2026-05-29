import { Injectable, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create.user.dto';
import { User } from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2'

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private userRepo: Repository<User>
    ) { }

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        // Kiểm tra email có tồn tại chưa
        const isUserExist = await this.userRepo.findOne({
            where: {
                deleted: false,
                email: createUserDto.email
            }
        })

        if (isUserExist) {
            throw new ConflictException('Đã có người dùng sở hữu email này rồi, hãy cung cấp email khác.');
        }

        // mã hóa mật khẩu
        const newPassword = await argon2.hash(createUserDto.password);

        // Lưu vào DB
        const newUser = await this.userRepo.create({
            fullName: createUserDto.fullName,
            email: createUserDto.email,
            password: newPassword
        })
        return await this.userRepo.save(newUser);
    }
}
