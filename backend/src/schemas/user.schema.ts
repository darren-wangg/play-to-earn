import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ default: 0 })
  points: number;

  @Prop()
  passwordHash?: string;

  @Prop({ type: [String], default: [] })
  authProviders: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
