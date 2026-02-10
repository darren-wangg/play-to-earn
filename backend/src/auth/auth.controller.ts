import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

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
  async googleSignIn(@Body('email') email: string) {
    const user = await this.authService.findOrCreateUser(email, 'google');
    return { email: user.email, id: user._id };
  }
}
