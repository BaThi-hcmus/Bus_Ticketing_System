import {
    CanActivate, // Là 1 interface của NestJS
    ExecutionContext,
    Injectable,
    UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class CustomJwtGuard implements CanActivate {
    // Inject JwtService để dùng hàm verify (hàm này sẽ tự băm và so sánh chữ ký hộ ta)
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService
    ) { }

    // Bắt buộc phải có hàm canActivate, 1 request muốn được thông qua thì phải trả ra true
    async canActivate(context: ExecutionContext): Promise<boolean> {
        // ExecutitonContext chứa thông tin về phiên kết nối hiện tại: REST API, websocket, microservices,..
        // Lấy đối tượng Request của Express ra
        const request = context.switchToHttp().getRequest<Request>();

        // bóc tách token ra
        const token = request.cookies['access_token'];

        if (!token) {
            throw new UnauthorizedException('Không tồn tại token trong Cookie');
        }

        // giải mã token để kiểm tra 
        try {
            // Hàm này tự xét thời gian hết hạn và so sánh chữ ký số để kiểm tra token có bị thay đổi không
            const payloadJwt = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>('JWT_SECRET')
            })

            request['user'] = {
                id: payloadJwt.id,
                email: payloadJwt.email,
                roles: payloadJwt.roles
            }

            return true;
        } catch (error) {
            console.error('JWT Verification Error:', error);
            throw new UnauthorizedException('Token không hợp lệ');
        }
    }
}