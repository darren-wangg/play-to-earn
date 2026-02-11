import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { GamesService } from './games.service';
import { OddsService } from './odds.service';
import { SettleService } from './settle.service';
import { AdminGuard } from '../common/guards/admin.guard';
import { SettleGameDto } from './dto/settle-game.dto';

@Controller('games')
@UseGuards(ThrottlerGuard)
export class GamesController {
  constructor(
    private readonly gamesService: GamesService,
    private readonly oddsService: OddsService,
    private readonly settleService: SettleService,
  ) {}

  @Get('next')
  @Throttle({ default: { ttl: 60000, limit: 30 } })
  async getNextGame() {
    const game = await this.gamesService.getNextGame();
    if (!game) {
      return { message: 'No upcoming Cavaliers game found' };
    }
    return game;
  }

  @Post('next')
  @UseGuards(AdminGuard)
  async fetchAndStoreNextGame() {
    const result = await this.oddsService.fetchNextCavsGame();
    if (!result) {
      throw new HttpException(
        'No upcoming Cavaliers game found in Odds API',
        HttpStatus.NOT_FOUND,
      );
    }
    const game = await this.gamesService.upsertGame(result.game);
    if (result.staleWarning) {
      return { ...game.toObject(), staleWarning: true };
    }
    return game;
  }

  @Post(':gameId/settle')
  @UseGuards(AdminGuard)
  async settleGame(
    @Param('gameId') gameId: string,
    @Body() dto: SettleGameDto,
  ) {
    return this.settleService.settle(gameId, dto);
  }
}
