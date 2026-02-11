import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
  HttpHealthIndicator,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private mongoose: MongooseHealthIndicator,
    private http: HttpHealthIndicator,
    private config: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    const apiKey = this.config.get<string>('ODDS_API_KEY');

    return this.health.check([
      () => this.mongoose.pingCheck('mongodb'),
      () =>
        this.http.pingCheck(
          'odds-api',
          `https://api.the-odds-api.com/v4/sports?apiKey=${apiKey}`,
        ),
    ]);
  }
}
