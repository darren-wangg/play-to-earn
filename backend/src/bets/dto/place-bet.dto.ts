import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class PlaceBetDto {
  @IsString()
  @IsNotEmpty()
  gameId: string;

  @IsIn(['cavaliers', 'opponent'])
  @IsNotEmpty()
  selection: string;
}
