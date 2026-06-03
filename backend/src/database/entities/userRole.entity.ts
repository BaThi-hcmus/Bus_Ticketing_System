import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne
} from 'typeorm'

import { User } from './user.entity';
import { Role } from './role.entity';

@Entity('User_Roles')
export class UserRole {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'int', name: 'user_id'})
    userId: number;

    @Column({type: 'int', name: 'role_id'})
    roleId: number;

    @ManyToOne(() => User, (user) => user.userRoles)
    user: User;

    @ManyToOne(() => Role, (role) => role.userRoles)
    role: Role;
}