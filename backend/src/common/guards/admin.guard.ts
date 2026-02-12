import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-admin-api-key'] as string | undefined;
    const adminKey = this.configService.get<string>('ADMIN_API_KEY');

    if (!apiKey || apiKey !== adminKey) {
      throw new UnauthorizedException('Invalid admin API key');
    }

    return true;
  }
}
