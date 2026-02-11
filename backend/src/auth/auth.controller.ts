import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import type { AuthenticatedRequest } from '../common/guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.registerWithPassword(
      dto.email,
      dto.password,
    );
    return { email: user.email, message: 'Registration successful' };
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateCredentials(
      dto.email,
      dto.password,
    );
    return { email: user.email, id: user._id };
  }

  @Post('google')
  async googleSignIn(@Body() dto: GoogleAuthDto) {
    const user = await this.authService.findOrCreateUser(dto.email, 'google');
    return { email: user.email, id: user._id };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@Req() req: AuthenticatedRequest) {
    const user = await this.authService.findUserById(req.user.userId);
    if (!user) {
      return { email: req.user.email, points: 0 };
    }
    return { email: user.email, points: user.points };
  }
}
