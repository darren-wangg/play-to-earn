import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { BetsService } from './bets.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { PlaceBetDto } from './dto/place-bet.dto';
import type { AuthenticatedRequest } from '../common/guards/auth.guard';

@Controller('bets')
@UseGuards(ThrottlerGuard)
export class BetsController {
  constructor(private readonly betsService: BetsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  async placeBet(@Req() req: AuthenticatedRequest, @Body() dto: PlaceBetDto) {
    return this.betsService.placeBet(req.user.userId, dto);
  }

  @Get()
  @UseGuards(AuthGuard)
  async getUserBets(@Req() req: AuthenticatedRequest) {
    return this.betsService.findByUserId(req.user.userId);
  }
}
