import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { GamesModule } from './games/games.module';
import { BetsModule } from './bets/bets.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/uptop-rain',
    ),
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60000, limit: 30 },
    ]),
    AuthModule,
    GamesModule,
    BetsModule,
    HealthModule,
  ],
})
export class AppModule {}
