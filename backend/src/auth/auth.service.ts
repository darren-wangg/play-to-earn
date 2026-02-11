import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findOrCreateUser(
    email: string,
    provider: string = 'google',
  ): Promise<UserDocument> {
    let user = await this.userModel.findOne({ email });
    if (!user) {
      user = await this.userModel.create({ email, authProviders: [provider] });
    } else if (!user.authProviders.includes(provider)) {
      user.authProviders.push(provider);
      await user.save();
    }
    return user;
  }

  async registerWithPassword(
    email: string,
    password: string,
  ): Promise<UserDocument> {
    const existing = await this.userModel.findOne({ email });

    if (existing) {
      if (existing.authProviders.includes('credentials')) {
        throw new ConflictException('An account with this email already exists');
      }
      // Google-only user linking a password
      existing.passwordHash = await bcrypt.hash(password, 10);
      existing.authProviders.push('credentials');
      await existing.save();
      return existing;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    return this.userModel.create({
      email,
      passwordHash,
      authProviders: ['credentials'],
    });
  }

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException(
        'This account uses Google sign-in. Please sign in with Google.',
      );
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

  async findUserById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id);
  }
}
