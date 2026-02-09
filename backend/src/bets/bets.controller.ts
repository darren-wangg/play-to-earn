import { Controller, Get, Post } from '@nestjs/common';
import { BetsService } from './bets.service';

@Controller('bets')
export class BetsController {
  constructor(private readonly betsService: BetsService) {}

  @Post()
  placeBet() {
    // TODO: Add AuthGuard, validate body, create bet
    return { message: 'Not yet implemented' };
  }

  @Get()
  getUserBets() {
    // TODO: Add AuthGuard, get userId from JWT, list bets
    return { message: 'Not yet implemented' };
  }
}
