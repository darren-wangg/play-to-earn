import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Game, GameDocument } from '../schemas/game.schema';

@Injectable()
export class GamesService {
  constructor(@InjectModel(Game.name) private gameModel: Model<GameDocument>) {}

  async getNextGame(): Promise<GameDocument | null> {
    return this.gameModel
      .findOne({ status: 'upcoming', startTime: { $gte: new Date() } })
      .sort({ startTime: 1 });
  }

  async findByGameId(gameId: string): Promise<GameDocument | null> {
    return this.gameModel.findOne({ gameId });
  }
}
