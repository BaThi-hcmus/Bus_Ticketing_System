import { User } from "src/database/entities/user.entity";

export interface SafeUserInterface extends Omit<User, 'password'> {
    roles?: string[],
    permissions?: string[]
}