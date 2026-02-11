import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Bet, BetDocument } from '../schemas/bet.schema';
import { GamesService } from '../games/games.service';
import { PlaceBetDto } from './dto/place-bet.dto';

@Injectable()
export class BetsService {
  constructor(
    @InjectModel(Bet.name) private betModel: Model<BetDocument>,
    private gamesService: GamesService,
  ) {}

  async placeBet(userId: string, dto: PlaceBetDto): Promise<BetDocument> {
    const game = await this.gamesService.findByGameId(dto.gameId);
    if (!game) {
      throw new BadRequestException('Game not found');
    }
    if (game.status !== 'upcoming') {
      throw new BadRequestException('Game is already finished');
    }
    if (new Date(game.startTime) <= new Date()) {
      throw new BadRequestException('Game has already started');
    }

    try {
      return await this.betModel.create({
        userId: new Types.ObjectId(userId),
        gameId: game._id,
        selection: dto.selection,
        status: 'pending',
      });
    } catch (error: unknown) {
      const mongoError = error as { code?: number };
      if (mongoError.code === 11000) {
        throw new ConflictException('You already placed a bet on this game');
      }
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<BetDocument[]> {
    return this.betModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('gameId')
      .sort({ createdAt: -1 })
      .lean();
  }
}
