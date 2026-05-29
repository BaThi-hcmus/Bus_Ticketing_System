import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/database/entities/permission.entity';
import { Repository } from 'typeorm';
import { CreatePermissionDto } from './dto/create.permission.dto';

@Injectable()
export class PermissionService {
    constructor(
        @InjectRepository(Permission) private permisisonRepo: Repository<Permission>
    ) { }

    async getPermissions(): Promise<Permission[]> {
        const permissions = await this.permisisonRepo.find({
            where: { deleted: false }
        })

        return permissions;
    }

    async createPermission(createPermissionDto: CreatePermissionDto): Promise<void> {
        // kiểm tra tên quyền có tồn tại chưa
        const isPermissionExist = await this.permisisonRepo.findOne({
            where: {
                deleted: false,
                name: createPermissionDto.name
            }
        })
        if (isPermissionExist) {
            throw new ConflictException('Quyển này đã tồn tại trong hệ thống');
        }

        // Lưu vào db
        const newPermisison = this.permisisonRepo.create({
            name: createPermissionDto.name
        })
        await this.permisisonRepo.save(newPermisison);
    }
}
