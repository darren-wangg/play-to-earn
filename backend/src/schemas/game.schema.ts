import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GameDocument = HydratedDocument<Game>;

@Schema({ timestamps: true })
export class Game {
  @Prop({ required: true, unique: true })
  gameId: string;

  @Prop({ required: true })
  homeTeam: string;

  @Prop({ required: true })
  awayTeam: string;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  spread: number;

  @Prop({ default: 'upcoming', enum: ['upcoming', 'finished'] })
  status: string;

  @Prop()
  finalHomeScore?: number;

  @Prop()
  finalAwayScore?: number;
}

export const GameSchema = SchemaFactory.createForClass(Game);
