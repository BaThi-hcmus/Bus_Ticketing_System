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

        // bóc tách header ra
        const authHeader = request.headers['authorization'];
        if (!authHeader) {
            throw new UnauthorizedException('Không tìm thấy header authorization');
        }

        const [bearer, token] = authHeader.split(' ');
        if (bearer != 'Bearer' || !token) {
            throw new UnauthorizedException('Sai định dạng token, phải là "Bearer token"');
        }

        // giải mã token để kiểm tra 
        try {
            const payloadJwt = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>('JWT_SECRET')
            })

            const currentTime = Math.floor(Date.now() / 1000);

            if (payloadJwt.exp && currentTime > payloadJwt.exp) {
                throw new UnauthorizedException('Access Token đã hết hạn sử dụng');
            }

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