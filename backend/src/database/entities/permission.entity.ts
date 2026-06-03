import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm'

import { RolePermission } from './rolePermissions.entity';
import { CategoryPermission } from './categoryPermission.entity';

export enum PermissionStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
  }

@Entity('Permissions')
export class Permission {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true, name: 'display_name' })
    displayName: string;

    @Column({ nullable: true, name: 'category_permission_id' })
    categoryPermissionId: number;

    @Column({ default: false })
    deleted: boolean;

    @Column({ 
        type: 'nvarchar',
        length: 50,
        default: PermissionStatus.ACTIVE
    })
    status: string;

    @CreateDateColumn({ type: 'datetime2', name: 'created_at' })
    createdAt: Date;

    @OneToMany(() => RolePermission, (rolePermission) => rolePermission.permission)
    rolePermissions: RolePermission[];

    @ManyToOne(() => CategoryPermission, (categoryPermission) => categoryPermission.permissions)
    @JoinColumn({ name: 'categoryPermissionId' })
    categoryPermission: CategoryPermission;
}