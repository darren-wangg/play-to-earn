import { IsNumber } from 'class-validator';

export class SettleGameDto {
  @IsNumber()
  finalHomeScore: number;

  @IsNumber()
  finalAwayScore: number;
}
