import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

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

const CAVALIERS = 'Cleveland Cavaliers';

@Injectable()
export class OddsService {
  private readonly logger = new Logger(OddsService.name);

  constructor(private configService: ConfigService) {}

  async fetchNextCavsGame(): Promise<ParsedCavsGame | null> {
    const apiKey = this.configService.get<string>('ODDS_API_KEY');
    const url = this.configService.get<string>('ODDS_API_ENDPOINT');
    if (!apiKey || !url) {
      this.logger.warn('ODDS_API_KEY or ODDS_API_ENDPOINT not configured');
      return null;
    }

    let data: OddsGame[];
    try {
      const response = await axios.get<OddsGame[]>(url, {
        params: {
          apiKey,
          regions: 'us',
          markets: 'spreads',
          oddsFormat: 'american',
        },
      });
      data = response.data;
    } catch (error) {
      this.logger.error(
        'Failed to fetch from Odds API',
        error instanceof Error ? error.message : String(error),
      );
      return null;
    }

    // Filter for Cavaliers games
    const cavsGames = data.filter(
      (g) => g.home_team === CAVALIERS || g.away_team === CAVALIERS,
    );

    if (cavsGames.length === 0) {
      this.logger.warn('No upcoming Cavaliers games found in Odds API');
      return null;
    }

    // Pick earliest game
    cavsGames.sort(
      (a, b) =>
        new Date(a.commence_time).getTime() -
        new Date(b.commence_time).getTime(),
    );
    const game = cavsGames[0];

    // Extract spread relative to Cavaliers
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
}
