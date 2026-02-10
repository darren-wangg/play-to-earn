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
import { GamesService } from './games.service';
import { OddsService } from './odds.service';
import { SettleService } from './settle.service';
import { AdminGuard } from '../common/guards/admin.guard';
import { SettleGameDto } from './dto/settle-game.dto';

@Controller('games')
export class GamesController {
  constructor(
    private readonly gamesService: GamesService,
    private readonly oddsService: OddsService,
    private readonly settleService: SettleService,
  ) {}

  @Get('next')
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
    const parsed = await this.oddsService.fetchNextCavsGame();
    if (!parsed) {
      throw new HttpException(
        'No upcoming Cavaliers game found in Odds API',
        HttpStatus.NOT_FOUND,
      );
    }
    return this.gamesService.upsertGame(parsed);
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
