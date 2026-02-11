import { BetsService } from './bets.service';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { Types } from 'mongoose';

describe('BetsService', () => {
  let service: BetsService;
  let betModel: any;
  let gamesService: any;

  const futureDate = new Date(Date.now() + 86400000).toISOString();
  const pastDate = new Date(Date.now() - 86400000).toISOString();

  beforeEach(() => {
    betModel = {
      create: jest.fn(),
      find: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue([]),
        }),
      }),
    };
    gamesService = { findByGameId: jest.fn() };
    service = new BetsService(betModel as any, gamesService);
  });

  describe('placeBet', () => {
    it('should throw if game not found', async () => {
      gamesService.findByGameId.mockResolvedValue(null);
      await expect(
        service.placeBet('user-id', { gameId: 'abc', selection: 'cavaliers' as const }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if game is finished', async () => {
      gamesService.findByGameId.mockResolvedValue({
        _id: new Types.ObjectId(),
        status: 'finished',
        startTime: futureDate,
      });
      await expect(
        service.placeBet('user-id', { gameId: 'abc', selection: 'cavaliers' as const }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if game has already started', async () => {
      gamesService.findByGameId.mockResolvedValue({
        _id: new Types.ObjectId(),
        status: 'upcoming',
        startTime: pastDate,
      });
      await expect(
        service.placeBet('user-id', { gameId: 'abc', selection: 'cavaliers' as const }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create a bet for valid game', async () => {
      const gameObjId = new Types.ObjectId();
      gamesService.findByGameId.mockResolvedValue({
        _id: gameObjId,
        status: 'upcoming',
        startTime: futureDate,
      });
      const mockCreated = { _id: 'bet-id', selection: 'cavaliers', status: 'pending' };
      betModel.create.mockResolvedValue(mockCreated);

      const result = await service.placeBet('507f1f77bcf86cd799439011', {
        gameId: 'abc',
        selection: 'cavaliers' as const,
      });

      expect(result).toEqual(mockCreated);
      expect(betModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          gameId: gameObjId,
          selection: 'cavaliers',
          status: 'pending',
        }),
      );
    });

    it('should throw ConflictException on duplicate bet', async () => {
      gamesService.findByGameId.mockResolvedValue({
        _id: new Types.ObjectId(),
        status: 'upcoming',
        startTime: futureDate,
      });
      betModel.create.mockRejectedValue({ code: 11000 });

      await expect(
        service.placeBet('507f1f77bcf86cd799439011', { gameId: 'abc', selection: 'cavaliers' as const }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findByUserId', () => {
    it('should return bets sorted by createdAt desc', async () => {
      const mockBets = [{ _id: 'bet-1' }, { _id: 'bet-2' }];
      betModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockBets),
        }),
      });

      const result = await service.findByUserId('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockBets);
    });
  });
});
