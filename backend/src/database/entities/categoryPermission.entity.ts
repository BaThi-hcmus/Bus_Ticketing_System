import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    OneToMany
} from 'typeorm'
import { Permission } from './permission.entity';

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

    @Column({ default: "active" })
    status: string;

    @OneToMany(() => Permission, (permission) => permission.categoryPermission)
    permissions: Permission[];
}