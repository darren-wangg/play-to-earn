import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Game, GameDocument } from '../schemas/game.schema';
import { ParsedCavsGame } from './odds.service';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

@Injectable()
export class GamesService {
  private cache: { data: GameDocument; expiresAt: number } | null = null;

  constructor(
    @InjectModel(Game.name) private gameModel: Model<GameDocument>,
  ) {}

  async getNextGame(): Promise<GameDocument | null> {
    if (this.cache && Date.now() < this.cache.expiresAt) {
      return this.cache.data;
    }

    const game = await this.gameModel
      .findOne({ status: 'upcoming', startTime: { $gte: new Date() } })
      .sort({ startTime: 1 })
      .lean<GameDocument>();

    if (game) {
      this.cache = { data: game, expiresAt: Date.now() + CACHE_TTL };
    }

    return game;
  }

  async findByGameId(gameId: string): Promise<GameDocument | null> {
    return this.gameModel.findOne({ gameId });
  }

  async upsertGame(parsed: ParsedCavsGame): Promise<GameDocument> {
    const game = await this.gameModel.findOneAndUpdate(
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

    // Invalidate cache on upsert
    this.cache = null;

    return game;
  }

  clearCache(): void {
    this.cache = null;
  }
}
