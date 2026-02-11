import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { GamesService } from './games.service';
import { OddsService } from './odds.service';
import { SettleService } from './settle.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private gamesService: GamesService,
    private oddsService: OddsService,
    private settleService: SettleService,
    private config: ConfigService,
  ) {}

  /**
   * Refresh odds from The Odds API.
   * Default: every 3 hours (safe for 500 req/month free tier).
   * Skips if no upcoming game or if odds were recently fetched.
   */
  @Cron(CronExpression.EVERY_3_HOURS)
  async refreshOdds() {
    this.logger.log('Cron: refreshing odds...');

    try {
      const result = await this.oddsService.fetchNextCavsGame();
      if (!result) {
        this.logger.log('Cron: no upcoming Cavaliers game found');
        return;
      }

      const game = await this.gamesService.upsertGame(result.game);
      this.logger.log(
        `Cron: odds updated for ${game.homeTeam} vs ${game.awayTeam} (spread: ${game.spread})`,
      );
    } catch (error) {
      this.logger.error(
        'Cron: odds refresh failed',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  /**
   * Auto-settle completed games by polling the Scores API.
   * Default: every 3 hours.
   * Skips if no unsettled games exist in DB.
   */
  @Cron(CronExpression.EVERY_3_HOURS)
  async autoSettle() {
    this.logger.log('Cron: checking for completed games...');

    try {
      const unsettled = await this.gamesService.findUnsettledGames();
      if (unsettled.length === 0) {
        this.logger.log('Cron: no unsettled games to check');
        return;
      }

      const scores = await this.oddsService.fetchCompletedScores();
      if (scores.length === 0) {
        this.logger.log('Cron: no completed scores found');
        return;
      }

      const unsettledIds = new Set(unsettled.map((g) => g.gameId));

      for (const score of scores) {
        if (!unsettledIds.has(score.gameId)) continue;

        try {
          const result = await this.settleService.settle(score.gameId, {
            finalHomeScore: score.homeScore,
            finalAwayScore: score.awayScore,
          });
          this.logger.log(
            `Cron: auto-settled game ${score.gameId} — ${result.settled.won} won, ${result.settled.lost} lost, ${result.settled.push} push`,
          );
        } catch (error) {
          this.logger.error(
            `Cron: failed to settle game ${score.gameId}`,
            error instanceof Error ? error.message : String(error),
          );
        }
      }
    } catch (error) {
      this.logger.error(
        'Cron: auto-settle check failed',
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}
