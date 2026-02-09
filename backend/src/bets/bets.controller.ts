import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { BetsService } from './bets.service';
import { AuthGuard } from '../common/guards/auth.guard';
import type { AuthenticatedRequest } from '../common/guards/auth.guard';

@Controller('bets')
export class BetsController {
  constructor(private readonly betsService: BetsService) {}

  @Post()
  @UseGuards(AuthGuard)
  placeBet(@Req() req: AuthenticatedRequest) {
    // TODO: validate body, create bet
    return { message: 'Not yet implemented', userId: req.user.userId };
  }

  @Get()
  @UseGuards(AuthGuard)
  getUserBets(@Req() req: AuthenticatedRequest) {
    // TODO: get userId from JWT, list bets
    return { message: 'Not yet implemented', userId: req.user.userId };
  }
}
