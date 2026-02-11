import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Game, GameSchema } from '../schemas/game.schema';
import { Bet, BetSchema } from '../schemas/bet.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { OddsService } from './odds.service';
import { SettleService } from './settle.service';
import { CronService } from './cron.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Game.name, schema: GameSchema },
      { name: Bet.name, schema: BetSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [GamesController],
  providers: [GamesService, OddsService, SettleService, CronService],
  exports: [GamesService],
})
export class GamesModule {}
