import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BetDocument = HydratedDocument<Bet>;

@Schema({ timestamps: true })
export class Bet {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, ref: 'Game', required: true })
  gameId: string;

  @Prop({ required: true, enum: ['cavaliers', 'opponent'] })
  selection: string;

  @Prop({ default: 'pending', enum: ['pending', 'won', 'lost', 'push'] })
  status: string;
}

export const BetSchema = SchemaFactory.createForClass(Bet);

BetSchema.index({ userId: 1, gameId: 1 }, { unique: true });
