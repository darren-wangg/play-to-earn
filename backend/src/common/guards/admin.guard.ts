import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-admin-api-key'] as string | undefined;

    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      throw new UnauthorizedException('Invalid admin API key');
    }

    return true;
  }
}
