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

  /** Returns the next upcoming Cavs game, served from a 5-min in-memory cache when possible. */
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
    return this.gameModel.findOne({ gameId }).lean();
  }

  /** Creates or updates a game from Odds API data and invalidates the cache. */
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
          lastOddsFetchedAt: new Date(),
        },
      },
      { upsert: true, new: true },
    );

    // Invalidate cache on upsert
    this.cache = null;

    return game;
  }

  /** Finds games that are still "upcoming" but whose start time has passed (candidates for auto-settle). */
  async findUnsettledGames(): Promise<GameDocument[]> {
    return this.gameModel
      .find({ status: 'upcoming', startTime: { $lt: new Date() } })
      .lean();
  }

  /** Returns the most recent upcoming game (used as fallback when Odds API is down). */
  async getLastUpcomingGame(): Promise<GameDocument | null> {
    return this.gameModel
      .findOne({ status: 'upcoming' })
      .sort({ startTime: -1 })
      .lean();
  }

  clearCache(): void {
    this.cache = null;
  }
}
