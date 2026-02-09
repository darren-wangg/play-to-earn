import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Bet, BetSchema } from '../schemas/bet.schema';
import { BetsController } from './bets.controller';
import { BetsService } from './bets.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Bet.name, schema: BetSchema }])],
  controllers: [BetsController],
  providers: [BetsService],
  exports: [BetsService],
})
export class BetsModule {}
