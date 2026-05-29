import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/database/entities/role.entity';
import { In, Repository, Not } from 'typeorm';
import { CreateRoleDto } from './dto/create.role.dto';
import { EditRoleDto } from './dto/edit.role.dto';
import { Permission } from 'src/database/entities/permission.entity';
import { RolePermission } from 'src/database/entities/rolePermissions.entity';
import { FilterStatus } from '../../../utils/filterStatus.util';
import { Search } from '../../../utils/search.util';
import { Pagination } from '../../../utils/pagination.util';
import { Sort } from 'src/utils/sort.ulti';

@Injectable()
export class RoleService {
    constructor(
        @InjectRepository(Role) private roleRepo: Repository<Role>,
        @InjectRepository(Permission) private permissionRepo: Repository<Permission>,
        @InjectRepository(RolePermission) private rolePermissionRepo: Repository<RolePermission>,
        private readonly filterStatus: FilterStatus,
        private readonly search: Search,
        private readonly pagination: Pagination,
        private readonly sort: Sort
    ) { }

    async getRoles(status: string, keyword: string, page: number, sortType: string): Promise<any> {
        const queryCondition = {
            deleted: false,
        }

        //filter
        const filterStatusObject = this.filterStatus.filterStatus(status, queryCondition);

        //search
        const { searchResult, whereCondition } = this.search.search(
            keyword,
            queryCondition,
            ["name"]
        );

        //pagination
        const paginationObject = await this.pagination.pagination(page, whereCondition, this.roleRepo);

        //sort
        const sortList = [
            {
                name: "Tên vai trò tăng dần",
                type: "name-src"
            },
            {
                name: "Tên vai trò giảm dần",
                type: "name-desc"
            },
            {
                name: "Thời gian tạo tăng dần",
                type: "createdAt-src"
            },
            {
                name: "Thời gian tạo giảm dần",
                type: "createdAt-desc"
            }
        ]
        const orderCondition = this.sort.sort(sortType, sortList);

        const result = await this.roleRepo.find({
            where: whereCondition,
            order: orderCondition,
            skip: paginationObject.startIndex,
            take: paginationObject.itemPerPage,
            relations: ['rolePermissions', 'rolePermissions.permission']
        })

        if (result) {
            result.forEach(role => {
                let permissions: Permission[] = [];
                if (role.rolePermissions && role.rolePermissions.length > 0) {
                    for (const rolePermission of role.rolePermissions) {
                        if (rolePermission?.permission) {
                            permissions.push(rolePermission.permission)
                        }
                    }
                }
                role['permissions'] = permissions;
            })
        }

        return {
            data: result,
            filterStatusObject: filterStatusObject,
            searchResult: searchResult,
            paginationObject: paginationObject,
            sortType: sortType,
            sortList: sortList
        };
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

    async editRole(id: number, editRoleDto: EditRoleDto): Promise<Role> {
        // 1. Kiểm tra role cần sửa có tồn tại (và chưa bị xóa) hay không
        const role = await this.roleRepo.findOne({
            where: { id: id, deleted: false }
        });

        if (!role) {
            throw new NotFoundException(`Không tìm thấy vai trò có ID [${id}] để cập nhật`);
        }

        const name = editRoleDto?.name;

        // 2. Kiểm tra trùng lặp tên với vai trò khác
        if (name) {
            const isRoleExist = await this.roleRepo.findOne({
                where: {
                    id: Not(id),
                    name: name,
                    deleted: false
                }
            })

            if (isRoleExist) {
                throw new ConflictException(`Vai trò [${name}] đã tồn tại trong hệ thống`);
            }
        }

        // 3. Nếu có cập nhật danh sách quyền (permissions)
        if (editRoleDto.permissions !== undefined) {
            if (editRoleDto.permissions.length > 0) {
                // Kiểm tra các permission id truyền vào có tồn tại hay không
                const validPermissions = await this.permissionRepo.find({
                    where: {
                        deleted: false,
                        id: In(editRoleDto.permissions)
                    }
                })

                if (validPermissions.length != editRoleDto.permissions.length) {
                    throw new ConflictException('Một số permission không tồn tại trong hệ thống');
                }
            }

            // Xóa tất cả các liên kết cũ trong bảng trung gian RolePermission
            await this.rolePermissionRepo.delete({ roleId: id });

            // Lưu các liên kết mới
            if (editRoleDto.permissions.length > 0) {
                const rolePermissions = editRoleDto.permissions.map(perId => {
                    return this.rolePermissionRepo.create({
                        roleId: id,
                        permissionId: perId
                    })
                })
                await this.rolePermissionRepo.save(rolePermissions);
            }
        }

        // 4. Tiến hành cập nhật thông tin cơ bản
        const { permissions, ...basicFields } = editRoleDto;
        await this.roleRepo.update({ id: id }, basicFields);

        // 5. Lấy lại thông tin sau khi cập nhật để trả về
        const updatedRole = await this.roleRepo.findOne({
            where: { id: id },
            relations: ['rolePermissions', 'rolePermissions.permission']
        });

        if (updatedRole) {
            let perms: Permission[] = [];
            if (updatedRole.rolePermissions && updatedRole.rolePermissions.length > 0) {
                for (const rp of updatedRole.rolePermissions) {
                    if (rp?.permission) {
                        perms.push(rp.permission);
                    }
                }
            }
            updatedRole['permissions'] = perms;
        }

        return updatedRole as any;
    }

    async getRoleDetail(id: number): Promise<any> {
        const role = await this.roleRepo.findOne({
            where: { id: id, deleted: false },
            relations: ['rolePermissions', 'rolePermissions.permission']
        });

        if (!role) {
            throw new NotFoundException(`Không tìm thấy vai trò có ID [${id}]`);
        }

        let permissions: Permission[] = [];
        if (role.rolePermissions && role.rolePermissions.length > 0) {
            for (const rolePermission of role.rolePermissions) {
                if (rolePermission?.permission) {
                    permissions.push(rolePermission.permission)
                }
            }
        }
        role['permissions'] = permissions;

        return role;
    }
}

