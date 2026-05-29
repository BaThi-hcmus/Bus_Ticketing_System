import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create.user.dto';
import { EditUserDto } from './dto/edit.user.dto';
import { User } from 'src/database/entities/user.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2'
import { Role } from 'src/database/entities/role.entity';
import { UserRole } from 'src/database/entities/userRole.entity';
import { Search } from '../../../utils/search.util';
import { Pagination } from '../../../utils/pagination.util';
import { Sort } from 'src/utils/sort.ulti';
import { FilterStatus } from '../../../utils/filterStatus.util';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(Role) private roleRepo: Repository<Role>,
        @InjectRepository(UserRole) private userRoleRepo: Repository<UserRole>,
        private readonly search: Search,
        private readonly pagination: Pagination,
        private readonly sort: Sort,
        private readonly filterStatus: FilterStatus
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

    async getUsers(query: any): Promise<any> {
        const keyword = query.keyword || '';
        const sortType = query.sortType || '';
        const status = query.status || '';
        const page = parseInt(query.page) || 1;

        const queryCondition = {
            deleted: false,
        };

        // filter
        const filterStatusObject = this.filterStatus.filterStatus(status, queryCondition);

        // search
        const { searchResult, whereCondition } = this.search.search(
            keyword,
            queryCondition,
            ['fullName', 'email'] // các trường muốn search
        );

        // pagination
        const paginationObject = await this.pagination.pagination(page, whereCondition, this.userRepo);

        // sort
        const sortList = [
            { name: "Tên người dùng tăng dần", type: "fullName-src" },
            { name: "Tên người dùng giảm dần", type: "fullName-desc" },
            { name: "Email tăng dần", type: "email-src" },
            { name: "Email giảm dần", type: "email-desc" },
            { name: "Thời gian tạo tăng dần", type: "createdAt-src" },
            { name: "Thời gian tạo giảm dần", type: "createdAt-desc" }
        ];
        const orderCondition = this.sort.sort(sortType, sortList);

        const rawData = await this.userRepo.find({
            where: whereCondition,
            order: orderCondition,
            skip: paginationObject.startIndex,
            take: paginationObject.itemPerPage,
            relations: ['userRoles', 'userRoles.role']
        });

        const data = rawData.map(user => {
            const { password, ...userWithoutPassword } = user;
            return {
                ...userWithoutPassword,
                roles: user.userRoles ? user.userRoles.map(ur => ur.role).filter(r => r && !r.deleted) : []
            };
        });

        return {
            data,
            filterStatusObject: filterStatusObject,
            searchResult: searchResult,
            paginationObject: paginationObject,
            sortType: sortType,
            sortList: sortList
        };
    }

    async getUserDetail(id: number): Promise<any> {
        const user = await this.userRepo.findOne({
            where: { id, deleted: false },
            relations: ['userRoles', 'userRoles.role']
        });

        if (!user) {
            throw new NotFoundException('Không tìm thấy người dùng');
        }

        const { password, ...userWithoutPassword } = user;
        const roles = user.userRoles ? user.userRoles.map(ur => ur.role).filter(r => r && !r.deleted) : [];

        return {
            ...userWithoutPassword,
            roles
        };
    }

    async updateUser(id: number, editUserDto: EditUserDto): Promise<void> {
        const user = await this.userRepo.findOne({ where: { id, deleted: false } });
        if (!user) {
            throw new NotFoundException('Không tìm thấy người dùng');
        }

        if (editUserDto.email && editUserDto.email !== user.email) {
            const emailExist = await this.userRepo.findOne({ where: { email: editUserDto.email, deleted: false } });
            if (emailExist) {
                throw new ConflictException('Email này đã được sử dụng');
            }
            user.email = editUserDto.email;
        }

        if (editUserDto.password) {
            user.password = await argon2.hash(editUserDto.password);
        }

        if (editUserDto.fullName !== undefined) user.fullName = editUserDto.fullName;
        if (editUserDto.status !== undefined) user.status = editUserDto.status;
        if (editUserDto.deleted !== undefined) user.deleted = editUserDto.deleted;

        await this.userRepo.save(user);

        if (editUserDto.roles && Array.isArray(editUserDto.roles)) {
            const isRolesExist = await this.roleRepo.find({
                where: {
                    deleted: false,
                    id: In(editUserDto.roles)
                }
            });
            if (isRolesExist.length !== editUserDto.roles.length) {
                throw new ConflictException('Một hoặc nhiều role không tồn tại');
            }

            // Xóa role cũ
            await this.userRoleRepo.delete({ userId: user.id });

            // Thêm role mới
            if (editUserDto.roles.length > 0) {
                const newUserRoles = editUserDto.roles.map(r => {
                    return this.userRoleRepo.create({
                        userId: user.id,
                        roleId: r
                    });
                });
                await this.userRoleRepo.save(newUserRoles);
            }
        }
    }
}
