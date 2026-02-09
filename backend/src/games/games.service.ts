import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Game, GameDocument } from '../schemas/game.schema';
import { ParsedCavsGame } from './odds.service';

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

  async upsertGame(parsed: ParsedCavsGame): Promise<GameDocument> {
    return this.gameModel.findOneAndUpdate(
      { gameId: parsed.gameId },
      {
        $set: {
          homeTeam: parsed.homeTeam,
          awayTeam: parsed.awayTeam,
          startTime: parsed.startTime,
          spread: parsed.spread,
          status: 'upcoming',
        },
      },
      { upsert: true, new: true },
    );
  }
}
