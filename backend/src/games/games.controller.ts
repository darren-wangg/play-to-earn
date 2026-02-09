import { Controller, Get, Post } from '@nestjs/common';
import { GamesService } from './games.service';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get('next')
  async getNextGame() {
    return this.gamesService.getNextGame();
  }

  @Post('next')
  fetchAndStoreNextGame() {
    // TODO: Add AdminGuard, call Odds API
    return { message: 'Not yet implemented' };
  }
}
