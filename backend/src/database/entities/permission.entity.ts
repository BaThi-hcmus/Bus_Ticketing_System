import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    CreateDateColumn
} from 'typeorm'

import { RolePermission } from './rolePermissions.entity';
import { Role } from './role.entity';

@Entity('Permissions')
export class Permission {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    displayName: string;

    @Column({ default: false })
    deleted: boolean;

    @Column({ default: 'active' })
    status: string;

    @CreateDateColumn({ type: 'datetime' })
    createdAt: Date;

    @OneToMany(() => RolePermission, (rolePermission) => rolePermission.permission)
    rolePermissions: RolePermission[];
}