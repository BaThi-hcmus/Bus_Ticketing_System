import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany
} from 'typeorm'

import { RolePermission } from './rolePermissions.entity';
import { Role } from './role.entity';

@Entity('Permissions')
export class Permission {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ default: false })
    deleted: boolean;

    @Column({ default: 'active' })
    status: string;

    @OneToMany(() => RolePermission, (rolePermission) => rolePermission.permission)
    rolePermissions: RolePermission[];
}