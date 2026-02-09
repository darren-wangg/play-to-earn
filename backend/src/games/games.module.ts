import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Game, GameSchema } from '../schemas/game.schema';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { OddsService } from './odds.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Game.name, schema: GameSchema }]),
  ],
  controllers: [GamesController],
  providers: [GamesService, OddsService],
  exports: [GamesService],
})
export class GamesModule {}
