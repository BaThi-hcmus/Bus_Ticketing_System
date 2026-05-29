import {
    Injectable, // dùng khi 1 class hoặc 1 interface muốn được inject ở 1 nơi khác
    UnauthorizedException, // lỗi xác thực (authen)
    ConflictException, // Lỗi xung đột
    Inject
} from '@nestjs/common';
import { LoginDto } from './dto/login.auth.dto';
import * as argon2 from 'argon2'
import { User } from 'src/database/entities/user.entity';

// Repository là 1 kiểu dữ liệu, dùng thao tác với bảng dữ liệu của Entity, cung cấp
// các hàm như: .find(), .findOne(), .save(), .delete(),...
import { Repository } from 'typeorm';

// Tìm cái Repository tương ứng để tiêm vào
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

// access token và refresh token
// CACHE_MANAGER là 1 string
import { CACHE_MANAGER } from '@nestjs/cache-manager';

// Cache là 1 kiểu dữ liệu, bên trong định nghĩa các phương thức get(), set(), del(),...
import type { Cache } from 'cache-manager';

// Thư viện crypto dùng sinh số ngẫu nhiên
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
    constructor(
        // Tiêm Repo User vào và khai báo biên userRepo với kiểu là Repository
        // để có thể dùng được các hàm .find(), .findOne(), .save(), .delete(),...
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        private readonly jwtService: JwtService,
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

        const roles = user.userRoles.map(item => item.role?.name).filter(Boolean);
        const permissionsSet = new Set<string>();

        // lấy ra permissions
        if (user.userRoles && user.userRoles.length > 0) {
            for (const userRole of user.userRoles) {

                if (userRole.role) {
                    if (userRole.role.rolePermissions && userRole.role.rolePermissions.length > 0) {
                        for (const rolePermission of userRole.role.rolePermissions) {

                            if (rolePermission.permission) {
                                permissionsSet.add(rolePermission.permission.name);
                            }
                        }
                    }
                }
            }
        }
        const permissions = Array.from(permissionsSet);

        // Tạo access token (chuỗi JWT) và refresh token (chuỗi string random bằng crypto)
        const accessTokenPayload = {
            sub: user.id,
            email: user.email,
            roles: roles
        }

        //tạo access token với TTL là 15 phút
        const accessToken = this.jwtService.sign(accessTokenPayload, { expiresIn: '15m' });

        //tạo refresh token bằng chuỗi random, độ lớn 40 bytes, tức là gồm 80 kí tự trong hệ thập lục phân
        const refreshToken = crypto.randomBytes(40).toString('hex');

        //Lưu vào trong redis 
        const redisRefreshTokenKey = `refresh_token:${refreshToken}`;
        await this.cacheManager.set(redisRefreshTokenKey, user.id, 30 * 24 * 60 * 60 * 1000);

        const redisPermissionsKey = `user:perms:${user.id}`;
        await this.cacheManager.set(redisPermissionsKey, permissions, 15 * 60 * 1000);

        return {
            refreshToken,
            accessToken
        }
    }
}
