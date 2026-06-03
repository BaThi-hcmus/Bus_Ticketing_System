import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    OneToMany
} from 'typeorm'
import { Permission } from './permission.entity';

export enum CategoryPermissionStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
  }

@Entity('CategoryPermission')
export class CategoryPermission {
    @PrimaryGeneratedColumn()   // khai báo khóa chính và tự động tăng
    id: number;

    @Column({ type: 'nvarchar', unique: true })
    name: string;

    @CreateDateColumn({ type: 'date' })
    createdAt: Date;

    @Column({ default: false })
    deleted: boolean;

    @Column({ 
        type: 'nvarchar',
        length: 50,
        default: CategoryPermissionStatus.ACTIVE
    })
    status: string;

    @OneToMany(() => Permission, (permission) => permission.categoryPermission)
    permissions: Permission[];
}