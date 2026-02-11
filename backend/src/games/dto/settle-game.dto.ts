import { IsNumber, Min } from 'class-validator';

export class SettleGameDto {
  @IsNumber()
  @Min(0)
  finalHomeScore: number;

  @IsNumber()
  @Min(0)
  finalAwayScore: number;
}
