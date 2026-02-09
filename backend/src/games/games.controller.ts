import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GamesService } from './games.service';
import { OddsService } from './odds.service';
import { AdminGuard } from '../common/guards/admin.guard';

@Controller('games')
export class GamesController {
  constructor(
    private readonly gamesService: GamesService,
    private readonly oddsService: OddsService,
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
}
