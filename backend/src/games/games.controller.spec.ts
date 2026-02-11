import { HttpException } from '@nestjs/common';
import { GamesController } from './games.controller';

describe('GamesController', () => {
  let controller: GamesController;
  let gamesService: any;
  let oddsService: any;
  let settleService: any;

  beforeEach(() => {
    gamesService = { getNextGame: jest.fn(), upsertGame: jest.fn() };
    oddsService = { fetchNextCavsGame: jest.fn() };
    settleService = { settle: jest.fn() };
    controller = new GamesController(gamesService, oddsService, settleService);
  });

  describe('getNextGame', () => {
    it('should return the next game when available', async () => {
      const game = {
        gameId: 'abc123',
        homeTeam: 'Cleveland Cavaliers',
        awayTeam: 'Miami Heat',
        spread: -4.5,
        status: 'upcoming',
      };
      gamesService.getNextGame.mockResolvedValue(game);

      const result = await controller.getNextGame();
      expect(result).toEqual(game);
    });

    it('should return message when no game found', async () => {
      gamesService.getNextGame.mockResolvedValue(null);

      const result = await controller.getNextGame();
      expect(result).toEqual({ message: 'No upcoming Cavaliers game found' });
    });
  });

  describe('fetchAndStoreNextGame', () => {
    it('should throw 404 when odds API returns null', async () => {
      oddsService.fetchNextCavsGame.mockResolvedValue(null);

      await expect(controller.fetchAndStoreNextGame()).rejects.toThrow(
        HttpException,
      );
    });

    it('should upsert game from fresh odds data', async () => {
      const parsed = {
        gameId: 'abc123',
        homeTeam: 'Cleveland Cavaliers',
        awayTeam: 'Miami Heat',
        startTime: new Date(),
        spread: -4.5,
      };
      const savedGame = { ...parsed, toObject: () => parsed };
      oddsService.fetchNextCavsGame.mockResolvedValue({
        game: parsed,
        staleWarning: false,
      });
      gamesService.upsertGame.mockResolvedValue(savedGame);

      const result = await controller.fetchAndStoreNextGame();
      expect(gamesService.upsertGame).toHaveBeenCalledWith(parsed);
      expect(result).toEqual(savedGame);
    });

    it('should include staleWarning when odds API fell back', async () => {
      const parsed = {
        gameId: 'abc123',
        homeTeam: 'Cleveland Cavaliers',
        awayTeam: 'Miami Heat',
        startTime: new Date(),
        spread: -4.5,
      };
      oddsService.fetchNextCavsGame.mockResolvedValue({
        game: parsed,
        staleWarning: true,
      });
      gamesService.upsertGame.mockResolvedValue({
        ...parsed,
        toObject: () => parsed,
      });

      const result = await controller.fetchAndStoreNextGame();
      expect(result).toEqual({ ...parsed, staleWarning: true });
    });
  });

  describe('settleGame', () => {
    it('should delegate to settleService', async () => {
      const settleResult = {
        gameId: 'abc123',
        adjustedMargin: 0.5,
        settled: { total: 2, won: 1, lost: 1, push: 0 },
      };
      settleService.settle.mockResolvedValue(settleResult);

      const result = await controller.settleGame('abc123', {
        finalHomeScore: 110,
        finalAwayScore: 105,
      });

      expect(settleService.settle).toHaveBeenCalledWith('abc123', {
        finalHomeScore: 110,
        finalAwayScore: 105,
      });
      expect(result).toEqual(settleResult);
    });
  });
});
