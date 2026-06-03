import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    OneToMany
} from 'typeorm';
import { Booking } from './booking.entity';
import { UserRole } from './userRole.entity';

export enum UserStatus {
    ACTIVE = 'active',
    PENDING = 'pending',
    BANNED = 'banned',
    INACTIVE = 'inactive'
}

@Entity('Users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'nvarchar', length: 100, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 255 }) // Password mặc định bị ẩn khỏi các câu query
    password: string;

    @Column({ type: 'nvarchar', length: 100 })
    fullName: string;

    @Column({ type: 'varchar', length: 15, unique: true, nullable: true })
    phoneNumber: string;

    @Column({ type: 'nvarchar', nullable: true })
    avatar: string;

    @Column({ 
        type: 'nvarchar',
        length: 50,
        default: UserStatus.ACTIVE
    })
    status: string;

    @Column({ default: false })
    deleted: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @CreateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Booking, (booking) => booking.user)
    bookings: Booking[];

    @OneToMany(() => UserRole, (userRole) => userRole.user)
    userRoles: UserRole[];
}