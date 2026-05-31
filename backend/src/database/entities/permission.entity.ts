import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    CreateDateColumn,
    ManyToOne
} from 'typeorm'

import { RolePermission } from './rolePermissions.entity';
import { CategoryPermission } from './categoryPermission.entity';

@Entity('Permissions')
export class Permission {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    displayName: string;

    @Column({ nullable: true })
    categoryPermissionId: number;

    @Column({ default: false })
    deleted: boolean;

    @Column({ default: 'active' })
    status: string;

    @CreateDateColumn({ type: 'datetime' })
    createdAt: Date;

    @OneToMany(() => RolePermission, (rolePermission) => rolePermission.permission)
    rolePermissions: RolePermission[];

    @ManyToOne(() => CategoryPermission, (categoryPermission) => categoryPermission.permissions)
    categoryPermission: CategoryPermission;
}