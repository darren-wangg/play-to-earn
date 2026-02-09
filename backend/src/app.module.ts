import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { GamesModule } from './games/games.module';
import { BetsModule } from './bets/bets.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/uptop-rain',
    ),
    AuthModule,
    GamesModule,
    BetsModule,
  ],
})
export class AppModule {}
