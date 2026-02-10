import { IsIn, IsString } from 'class-validator';

export class PlaceBetDto {
  @IsString()
  gameId: string;

  @IsIn(['cavaliers', 'opponent'])
  selection: string;
}
