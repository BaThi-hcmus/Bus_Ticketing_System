import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/database/entities/role.entity';
import { In, Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create.role.dto';
import { Permission } from 'src/database/entities/permission.entity';
import { RolePermission } from 'src/database/entities/rolePermissions.entity';

@Injectable()
export class RoleService {
    constructor(
        @InjectRepository(Role) private roleRepo: Repository<Role>,
        @InjectRepository(Permission) private permissionRepo: Repository<Permission>,
        @InjectRepository(RolePermission) private rolePermissionRepo: Repository<RolePermission>
    ) { }

    async getRoles(): Promise<any> {
        const roles = await this.roleRepo.find({
            where: { deleted: false },
            relations: ['rolePermissions', 'rolePermissions.permission']
        })

        if (roles) {
            roles.forEach(role => {
                let permissions: Permission[] = [];
                if (role.rolePermissions && role.rolePermissions.length > 0) {
                    for (const rolePermission of role.rolePermissions) {
                        permissions.push(rolePermission?.permission)
                    }
                }
                role['permissions'] = permissions;
            })
        }

        return roles;
    }

    async createRole(createRoleDto: CreateRoleDto): Promise<void> {
        // Kiểm tra tên role có tồn tại trong hệ thống chưa
        const isRoleExist = await this.roleRepo.findOne({
            where: {
                deleted: false,
                name: createRoleDto.name
            }
        })
        if (isRoleExist) {
            throw new ConflictException('Quyền này đã tồn tại trong hệ thống');
        }

        // Chỉ cho phép tạo với các permisison đã tồn tại trong hệ thống 
        if (createRoleDto.permissions && createRoleDto.permissions.length > 0) {
            // lấy ra danh sách permission từ DB
            const validPermisisons = await this.permissionRepo.find({
                where: {
                    deleted: false,
                    id: In(createRoleDto.permissions)
                }
            })

            if (validPermisisons.length != createRoleDto.permissions.length) {
                throw new ConflictException('Permission không tồn tại trong hệ thống');
            }
        }

        // Lưu vào DB
        // Bảng role
        const newRole = this.roleRepo.create({ name: createRoleDto.name });
        const savedRole = await this.roleRepo.save(newRole);

        // Bảng rolePermission : lưu roleId và permissionId
        if (createRoleDto.permissions && createRoleDto.permissions.length > 0) {
            const rolePermissions = createRoleDto.permissions.map(perId => {
                return this.rolePermissionRepo.create({
                    roleId: savedRole.id,
                    permissionId: perId
                })
            })
            await this.rolePermissionRepo.save(rolePermissions);
        }
    }
}
