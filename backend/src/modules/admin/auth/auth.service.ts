import {
    Injectable, // dùng khi 1 class hoặc 1 interface muốn được inject ở 1 nơi khác
    UnauthorizedException, // lỗi xác thực (authen)
    Inject,
    NotFoundException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.auth.dto';
import * as argon2 from 'argon2'
import { User } from 'src/database/entities/user.entity';

// Repository là 1 kiểu dữ liệu, dùng thao tác với bảng dữ liệu của Entity, cung cấp
// các hàm như: .find(), .findOne(), .save(), .delete(),...
import { Repository } from 'typeorm';

// Tìm cái Repository tương ứng để tiêm vào
import { InjectRepository } from '@nestjs/typeorm';

// access token và refresh token
// CACHE_MANAGER là 1 string
import { CACHE_MANAGER } from '@nestjs/cache-manager';

// Cache là 1 kiểu dữ liệu, bên trong định nghĩa các phương thức get(), set(), del(),...
import type { Cache } from 'cache-manager';

// Thư viện crypto dùng sinh số ngẫu nhiên
import * as crypto from 'crypto';

// Lấy ra cookie 
import { Request } from 'express';

@Injectable()
export class AuthService {
    constructor(
        // Tiêm Repo User vào và khai báo biên userRepo với kiểu là Repository
        // để có thể dùng được các hàm .find(), .findOne(), .save(), .delete(),...
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }

    async login(loginDto: LoginDto) {
        //truy vấn theo email
        // Lấy ra các thuộc tính cần thiết gửi cho frontend thông qua chuỗi JWT
        const user = await this.userRepo.findOne({
            where: {
                deleted: false,
                email: loginDto.email
            },
            relations: [
                'userRoles',
                'userRoles.role',
                'userRoles.role.rolePermissions',
                'userRoles.role.rolePermissions.permission'
            ]
        })

        if (user == null) {
            throw new UnauthorizedException('Tài khoản không tồn tại');
        }

        //kiểm tra mật khẩu
        const checkPassword = await argon2.verify(user.password, loginDto.password);
        if (!checkPassword) {
            throw new UnauthorizedException('Tài khoản không tồn tại');
        }

        // kiểm tra tài khoản còn hoạt động không 
        if (user.status == "inactive") {
            throw new UnauthorizedException('Tài khoản của bạn đang bị khóa');
        }

        //tạo session id bằng chuỗi random, độ lớn 40 bytes, tức là gồm 80 kí tự trong hệ thập lục phân
        const sessionId = crypto.randomBytes(40).toString('hex');

        //Lưu vào trong redis 
        const redisSessionIdKey = `session_id:${sessionId}`;
        await this.cacheManager.set(redisSessionIdKey, user.id, 24 * 60 * 60 * 1000);

        return {
            sessionId
        }
    }

    async logout(request: Request): Promise<void> {
        // Lấy refresh token
        const sessionId = request.cookies['session_id'];

        // Nếu đã hết hạn thì bỏ qua
        if (sessionId) {
            // xóa trong redis
            const redisKey = `session_id:${sessionId}`;
            await this.cacheManager.del(redisKey);
        }
    }

    async getProfile(request: Request): Promise<any> {
        const id = request['user'].id;

        const user = await this.userRepo.findOne({
            where: {
                id: id,
                deleted: false 
            },
            relations: [
                'userRoles',
                'userRoles.role'
            ]
        })

        if (user) {
            const roles: string[] = [];
            user?.userRoles.forEach(userRole => {
                roles.push(userRole?.role.name);
            })
            user['roles'] = roles;
            // gắn permissions
            user['permissions'] = request['user'].permissions;
            // Loại bỏ password
            const {password, userRoles, ...userExceptPassword} = user as any;

            return userExceptPassword;
        } else {
            throw new NotFoundException('Không tìm thấy user');
        }
    }
}
