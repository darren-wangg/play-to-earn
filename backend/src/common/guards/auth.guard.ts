import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { jwtVerify } from 'jose';
import { AuthService } from '../../auth/auth.service';

export interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string };
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }

    const token = authHeader.substring(7);
    const secret = new TextEncoder().encode(
      this.configService.get<string>('NEXTAUTH_SECRET'),
    );

    try {
      const { payload } = await jwtVerify(token, secret);
      const email = payload.email as string;
      if (!email) {
        throw new UnauthorizedException('Invalid token: missing email');
      }

      const user = await this.authService.findOrCreateUser(email);
      request.user = {
        userId: user._id.toString(),
        email: user.email,
      };
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
