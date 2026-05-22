import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany
} from 'typeorm'

import { RolePermission } from './rolePermissions.entity';
import { UserRole } from './userRole.entity';

@Entity('Roles')
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
    rolePermissions: RolePermission[];

    @OneToMany(() => UserRole, (userRole) => userRole.role)
    userRoles: UserRole[];
}