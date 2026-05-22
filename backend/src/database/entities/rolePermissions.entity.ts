import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne
} from 'typeorm'

import { Role } from './role.entity';
import { Permission } from './permission.entity';

@Entity('Role_Permissions')
export class RolePermission {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    roleId: number;

    @Column()
    permissionId: number;

    @ManyToOne(() => Role, (role) => role.rolePermissions)
    role: Role;

    @ManyToOne(() => Permission, (permission) => permission.rolePermissions)
    permission: Permission;
}