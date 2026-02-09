import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findOrCreateUser(email: string): Promise<UserDocument> {
    let user = await this.userModel.findOne({ email });
    if (!user) {
      user = await this.userModel.create({ email });
    }
    return user;
  }

  async findUserById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id);
  }
}
