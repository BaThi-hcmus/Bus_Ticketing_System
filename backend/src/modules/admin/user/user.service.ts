import { Injectable, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create.user.dto';
import { User } from 'src/database/entities/user.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2'
import { Role } from 'src/database/entities/role.entity';
import { UserRole } from 'src/database/entities/userRole.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(Role) private roleRepo: Repository<Role>,
        @InjectRepository(UserRole) private userRoleRepo: Repository<UserRole>
    ) { }

    async createUser(createUserDto: CreateUserDto): Promise<void> {
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

        // Kiểm tra các role id truyền vào có tồn tại trong hệ thống chưa
        const isRolesExist = await this.roleRepo.find({
            where: {
                deleted: false,
                id: In(createUserDto.roles)
            }
        })
        if (isRolesExist.length != createUserDto.roles.length) {
            throw new ConflictException('role không tồn tại trong hệ thống');
        }

        // Lưu vào DB
        // Bảng user 
        const newUser = await this.userRepo.create({
            fullName: createUserDto.fullName,
            email: createUserDto.email,
            password: newPassword
        })
        const savedUser = await this.userRepo.save(newUser);

        // Bảng User Role
        const newUserRoles = createUserDto.roles.map(r => {
            return this.userRoleRepo.create({
                userId: savedUser.id,
                roleId: r
            })
        })
        await this.userRoleRepo.save(newUserRoles);
    }
}
