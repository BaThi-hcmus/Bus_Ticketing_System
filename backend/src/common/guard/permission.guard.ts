import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException, // lỗi phân quyền 
    Inject,
    UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import type { Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';

// class Reflector dùng để đọc metadata trong RAM
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        @InjectRepository(User) private userRepo: Repository<User>,
        private reflector: Reflector
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Đọc metadata và lấy ra quyền cần kiểm tra 
        // Sau đó áp dụng cho hàm đã được nạp vào RAM chuẩn bị thực thi
        const requiredPermission = this.reflector.get<string>('required_permission',
            context.getHandler()
        )
        //Nếu API không yêu cầu quyền thì cho qua
        if (!requiredPermission) {
            return true;
        }

        // Lấy đối tượng Request của Express ra
        const request = context.switchToHttp().getRequest<Request>();
        // Lấy sessionID
        const sessionId = request.cookies['session_id'];
        if (!sessionId) {
            throw new UnauthorizedException('Không tìm thấy sessionId, vui lòng đăng nhập lại');
        }

        // Truy vấn vào redis để lấy user_id
        const userId = await this.cacheManager.get(`session_id:${sessionId}`);
        if (!userId) {
            throw new UnauthorizedException('Không tìm thấy user_id trong cache, vui lòng đăng nhập lại');
        }

        // Truy vấn trong sql_server để lấy permission
        let user: User | null = null;
        try {
            user = await this.userRepo.findOne({
                where: {
                    deleted: false,
                    id: Number(userId)
                },
                relations: [
                    'userRoles',
                    'userRoles.role',
                    'userRoles.role.rolePermissions',
                    'userRoles.role.rolePermissions.permission'
                ]
            })
        } catch (error) {
            throw new ForbiddenException('Hệ thống gặp lỗi khi xác thực quyền của bạn');
        }
    
        // Nếu có user thì lấy ra permissions 
        let permissions: string[] = [];
        if (user) {
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
            permissions = Array.from(permissionsSet);
        } else {
            throw new ForbiddenException(`Lỗi không tìm thấy người dùng có ID là: ${userId}`);
        }

        // Kiểm tra quyền
        if (!permissions.includes(requiredPermission)) {
            throw new ForbiddenException('Bạn không có quyền truy cập vào API này');
        }

        // Gắn thông tin user vào request
        request['user'] = {
            id: user.id,
            email: user.email,
            permissions: permissions
        }

        return true;
    }
}