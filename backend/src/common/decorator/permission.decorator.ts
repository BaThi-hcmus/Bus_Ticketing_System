import { SetMetadata } from "@nestjs/common";

export const RequiredPermission = (permission: string) => {
    return SetMetadata('required_permission', permission);
}