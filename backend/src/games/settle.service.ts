import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Game, GameDocument } from '../schemas/game.schema';
import { Bet, BetDocument } from '../schemas/bet.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { SettleGameDto } from './dto/settle-game.dto';
import { GamesService } from './games.service';

@Injectable()
export class SettleService {
  constructor(
    @InjectModel(Game.name) private gameModel: Model<GameDocument>,
    @InjectModel(Bet.name) private betModel: Model<BetDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private gamesService: GamesService,
  ) {}

  /**
   * Settles a game: records final scores, computes adjusted margin (Cavs margin + spread),
   * and updates all pending bets to won/lost/push. Awards 100 points per winning bet.
   */
  async settle(gameId: string, dto: SettleGameDto) {
    const game = await this.gameModel.findOne({ gameId });
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    if (game.status === 'finished') {
      throw new BadRequestException('Game has already been settled');
    }

    game.finalHomeScore = dto.finalHomeScore;
    game.finalAwayScore = dto.finalAwayScore;
    game.status = 'finished';
    await game.save();

    // Invalidate cached "next game" so stale data isn't served
    this.gamesService.clearCache();

    // Spread is relative to Cavaliers — compute margin from Cavs' perspective
    const CAVALIERS = 'Cleveland Cavaliers';
    const cavsAreHome = game.homeTeam === CAVALIERS;
    const cavsMargin = cavsAreHome
      ? dto.finalHomeScore - dto.finalAwayScore
      : dto.finalAwayScore - dto.finalHomeScore;
    const adjustedMargin = cavsMargin + game.spread;

    const bets = await this.betModel.find({
      gameId: game._id,
      status: 'pending',
    });

    let won = 0;
    let lost = 0;
    let push = 0;

    for (const bet of bets) {
      let result: 'won' | 'lost' | 'push';

      if (adjustedMargin === 0) {
        result = 'push';
      } else if (bet.selection === 'cavaliers') {
        result = adjustedMargin > 0 ? 'won' : 'lost';
      } else {
        result = adjustedMargin < 0 ? 'won' : 'lost';
      }

      bet.status = result;
      await bet.save();

      if (result === 'won') {
        await this.userModel.updateOne(
          { _id: bet.userId },
          { $inc: { points: 100 } },
        );
        won++;
      } else if (result === 'lost') {
        lost++;
      } else {
        push++;
      }
    }

    return {
      gameId: game.gameId,
      finalHomeScore: dto.finalHomeScore,
      finalAwayScore: dto.finalAwayScore,
      spread: game.spread,
      adjustedMargin,
      settled: { total: bets.length, won, lost, push },
    };
  }
}
