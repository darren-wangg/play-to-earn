import { Injectable, Logger, forwardRef, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { GamesService } from './games.service';

interface OddsOutcome {
  name: string;
  price: number;
  point: number;
}

interface OddsMarket {
  key: string;
  outcomes: OddsOutcome[];
}

interface OddsBookmaker {
  key: string;
  title: string;
  markets: OddsMarket[];
}

interface OddsGame {
  id: string;
  sport_key: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: OddsBookmaker[];
}

export interface ParsedCavsGame {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  startTime: Date;
  spread: number;
}

export interface FetchResult {
  game: ParsedCavsGame;
  staleWarning: boolean;
}

const CAVALIERS = 'Cleveland Cavaliers';

@Injectable()
export class OddsService {
  private readonly logger = new Logger(OddsService.name);
  private readonly client = axios.create();

  // Circuit breaker state
  private circuitOpen = false;
  private circuitOpenedAt = 0;
  private readonly circuitCooldown = 30_000; // 30s before retrying

  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => GamesService))
    private gamesService: GamesService,
  ) {
    // Configure axios-retry: 3 attempts with exponential backoff (1s, 2s, 4s)
    axiosRetry(this.client, {
      retries: 3,
      retryDelay: (retryCount) => retryCount * 1000 * Math.pow(2, retryCount - 1),
      retryCondition: (error) =>
        axiosRetry.isNetworkOrIdempotentRequestError(error) ||
        (error.response?.status ?? 0) >= 500,
    });
  }

  /**
   * Fetches the next Cavaliers game from The Odds API with spreads.
   * Uses a circuit breaker: if the API fails, returns stale DB data for 30s before retrying.
   */
  async fetchNextCavsGame(): Promise<FetchResult | null> {
    const apiKey = this.configService.get<string>('ODDS_API_KEY');
    const url = this.configService.get<string>('ODDS_API_ENDPOINT');
    if (!apiKey || !url) {
      this.logger.warn('ODDS_API_KEY or ODDS_API_ENDPOINT not configured');
      return null;
    }

    // Circuit breaker: skip API call if circuit is open and cooldown hasn't elapsed
    if (this.circuitOpen) {
      if (Date.now() - this.circuitOpenedAt < this.circuitCooldown) {
        this.logger.warn('Circuit breaker open — returning stale data');
        return this.getFallback();
      }
      this.circuitOpen = false;
    }

    try {
      const response = await this.client.get<OddsGame[]>(url, {
        params: {
          apiKey,
          regions: 'us',
          markets: 'spreads',
          oddsFormat: 'american',
        },
        timeout: 10_000,
      });

      const parsed = this.parseResponse(response.data);
      if (!parsed) return null;

      // Reset circuit breaker on success
      this.circuitOpen = false;
      return { game: parsed, staleWarning: false };
    } catch (error) {
      this.logger.error(
        'Odds API failed after retries',
        error instanceof Error ? error.message : String(error),
      );

      // Open circuit breaker
      this.circuitOpen = true;
      this.circuitOpenedAt = Date.now();

      return this.getFallback();
    }
  }

  private parseResponse(data: OddsGame[]): ParsedCavsGame | null {
    const cavsGames = data.filter(
      (g) => g.home_team === CAVALIERS || g.away_team === CAVALIERS,
    );

    if (cavsGames.length === 0) {
      this.logger.warn('No upcoming Cavaliers games found in Odds API');
      return null;
    }

    cavsGames.sort(
      (a, b) =>
        new Date(a.commence_time).getTime() -
        new Date(b.commence_time).getTime(),
    );
    const game = cavsGames[0];

    const spreadsMarket = game.bookmakers[0]?.markets.find(
      (m) => m.key === 'spreads',
    );
    if (!spreadsMarket) {
      this.logger.warn(`No spreads market found for game ${game.id}`);
      return null;
    }

    const cavsOutcome = spreadsMarket.outcomes.find(
      (o) => o.name === CAVALIERS,
    );
    if (!cavsOutcome) {
      this.logger.warn(`No Cavaliers outcome found for game ${game.id}`);
      return null;
    }

    return {
      gameId: game.id,
      homeTeam: game.home_team,
      awayTeam: game.away_team,
      startTime: new Date(game.commence_time),
      spread: cavsOutcome.point,
    };
  }

  /** Fetches recently completed NBA scores for auto-settlement. */
  async fetchCompletedScores(): Promise<
    { gameId: string; homeScore: number; awayScore: number }[]
  > {
    const apiKey = this.configService.get<string>('ODDS_API_KEY');
    if (!apiKey) return [];

    try {
      const response = await this.client.get<
        {
          id: string;
          completed: boolean;
          scores: { name: string; score: string }[] | null;
        }[]
      >('https://api.the-odds-api.com/v4/sports/basketball_nba/scores', {
        params: { apiKey, daysFrom: 1 },
        timeout: 10_000,
      });

      return response.data
        .filter((g) => g.completed && g.scores?.length === 2)
        .map((g) => {
          const [team1, team2] = g.scores!;
          // Scores API returns teams in home/away order matching the event
          return {
            gameId: g.id,
            homeScore: parseInt(team1.score, 10),
            awayScore: parseInt(team2.score, 10),
          };
        });
    } catch (error) {
      this.logger.error(
        'Failed to fetch scores',
        error instanceof Error ? error.message : String(error),
      );
      return [];
    }
  }

  private async getFallback(): Promise<FetchResult | null> {
    const staleGame = await this.gamesService.getLastUpcomingGame();

    if (staleGame) {
      this.logger.warn('Returning stale game data as fallback');
      return {
        game: {
          gameId: staleGame.gameId,
          homeTeam: staleGame.homeTeam,
          awayTeam: staleGame.awayTeam,
          startTime: staleGame.startTime,
          spread: staleGame.spread,
        },
        staleWarning: true,
      };
    }

    return null;
  }
}
