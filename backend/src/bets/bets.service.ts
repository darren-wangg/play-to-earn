import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Bet, BetDocument } from '../schemas/bet.schema';

@Injectable()
export class BetsService {
  constructor(@InjectModel(Bet.name) private betModel: Model<BetDocument>) {}

  async findByUserId(userId: string): Promise<BetDocument[]> {
    return this.betModel.find({ userId }).sort({ createdAt: -1 });
  }
}
