import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException, // lỗi phân quyền 
    Inject
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

        const id = request['user'].id;

        try {
            //truy vấn trong redis
            const redisPermissionsKey = `user:perms:${id}`;
            let permissions: string[] | undefined = await this.cacheManager.get(redisPermissionsKey);

            // nếu dữ liệu trong redis không còn thì vào sql server để lấy ra
            // và nạp lại vào redis
            if (!permissions) {
                const user = await this.userRepo.findOne({
                    where: {
                        deleted: false,
                        id: id
                    },
                    relations: [
                        'userRoles',
                        'userRoles.role',
                        'userRoles.role.rolePermissions',
                        'userRoles.role.rolePermissions.permission'
                    ]
                })

                // Nếu có user thì lấy ra permissions và lưu lại vào redis
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

                    // nạp lại vào redis
                    await this.cacheManager.set(redisPermissionsKey, permissions, 15 * 60 * 1000);
                } else {
                    throw new ForbiddenException(`Lỗi không tìm thấy người dùng có ID là: ${id}`);
                }
            }

            if (!permissions.includes(requiredPermission)) {
                throw new ForbiddenException('Bạn không có quyền truy cập vào API này');
            }

            // Gắn thêm thông tin permissions vào user 
            request['user'].permissions = permissions;

            return true;
        } catch (error) {
            throw new ForbiddenException('Bạn không có quyền truy cập vào API này');
        }
    }
}