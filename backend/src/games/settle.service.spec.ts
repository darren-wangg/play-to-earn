import { SettleService } from './settle.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

// Helper to create mock Mongoose documents
const mockGame = (overrides = {}) => ({
  _id: 'game-obj-id',
  gameId: 'test-game-123',
  homeTeam: 'Cleveland Cavaliers',
  awayTeam: 'Miami Heat',
  startTime: new Date('2026-02-15T00:00:00Z'),
  spread: -4.5,
  status: 'upcoming',
  finalHomeScore: null,
  finalAwayScore: null,
  save: jest.fn(),
  ...overrides,
});

const mockBet = (selection: string, overrides = {}) => ({
  _id: `bet-${Math.random()}`,
  userId: 'user-obj-id',
  gameId: 'game-obj-id',
  selection,
  status: 'pending',
  save: jest.fn(),
  ...overrides,
});

describe('SettleService', () => {
  let service: SettleService;
  let gameModel: any;
  let betModel: any;
  let userModel: any;
  let gamesService: any;

  beforeEach(() => {
    gameModel = { findOne: jest.fn() };
    betModel = { find: jest.fn() };
    userModel = { updateOne: jest.fn() };
    gamesService = { clearCache: jest.fn() };
    service = new SettleService(gameModel as any, betModel as any, userModel as any, gamesService as any);
  });

  it('should throw NotFoundException if game not found', async () => {
    gameModel.findOne.mockResolvedValue(null);
    await expect(
      service.settle('nonexistent', { finalHomeScore: 100, finalAwayScore: 90 }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if game already settled', async () => {
    gameModel.findOne.mockResolvedValue(mockGame({ status: 'finished' }));
    await expect(
      service.settle('test-game-123', { finalHomeScore: 100, finalAwayScore: 90 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should settle cavaliers bet as won when Cavs cover the spread (home)', async () => {
    const game = mockGame({ spread: -4.5 }); // Cavs favored by 4.5
    gameModel.findOne.mockResolvedValue(game);

    const bet = mockBet('cavaliers');
    betModel.find.mockResolvedValue([bet]);
    userModel.updateOne.mockResolvedValue({});

    // Cavs 110, Heat 105 → cavsMargin=5, adjusted=5+(-4.5)=0.5 > 0 → won
    const result = await service.settle('test-game-123', {
      finalHomeScore: 110,
      finalAwayScore: 105,
    });

    expect(bet.status).toBe('won');
    expect(bet.save).toHaveBeenCalled();
    expect(userModel.updateOne).toHaveBeenCalledWith(
      { _id: 'user-obj-id' },
      { $inc: { points: 100 } },
    );
    expect(result.settled.won).toBe(1);
    expect(result.settled.lost).toBe(0);
    expect(result.adjustedMargin).toBe(0.5);
  });

  it('should settle cavaliers bet as lost when Cavs dont cover', async () => {
    const game = mockGame({ spread: -4.5 });
    gameModel.findOne.mockResolvedValue(game);

    const bet = mockBet('cavaliers');
    betModel.find.mockResolvedValue([bet]);

    // Cavs 108, Heat 105 → cavsMargin=3, adjusted=3+(-4.5)=-1.5 < 0 → lost
    const result = await service.settle('test-game-123', {
      finalHomeScore: 108,
      finalAwayScore: 105,
    });

    expect(bet.status).toBe('lost');
    expect(result.settled.lost).toBe(1);
    expect(result.settled.won).toBe(0);
  });

  it('should settle opponent bet as won when Cavs dont cover', async () => {
    const game = mockGame({ spread: -4.5 });
    gameModel.findOne.mockResolvedValue(game);

    const bet = mockBet('opponent');
    betModel.find.mockResolvedValue([bet]);
    userModel.updateOne.mockResolvedValue({});

    // Cavs 108, Heat 105 → adjusted=-1.5 < 0 → opponent wins
    const result = await service.settle('test-game-123', {
      finalHomeScore: 108,
      finalAwayScore: 105,
    });

    expect(bet.status).toBe('won');
    expect(result.settled.won).toBe(1);
  });

  it('should handle push when adjusted margin is exactly 0', async () => {
    const game = mockGame({ spread: -5 });
    gameModel.findOne.mockResolvedValue(game);

    const cavsBet = mockBet('cavaliers');
    const oppBet = mockBet('opponent');
    betModel.find.mockResolvedValue([cavsBet, oppBet]);

    // Cavs 110, Heat 105 → cavsMargin=5, adjusted=5+(-5)=0 → push for both
    const result = await service.settle('test-game-123', {
      finalHomeScore: 110,
      finalAwayScore: 105,
    });

    expect(cavsBet.status).toBe('push');
    expect(oppBet.status).toBe('push');
    expect(result.settled.push).toBe(2);
    expect(result.settled.won).toBe(0);
    expect(userModel.updateOne).not.toHaveBeenCalled();
  });

  it('should handle Cavaliers as away team', async () => {
    const game = mockGame({
      homeTeam: 'Miami Heat',
      awayTeam: 'Cleveland Cavaliers',
      spread: 3.5, // Cavs are underdogs by 3.5
    });
    gameModel.findOne.mockResolvedValue(game);

    const bet = mockBet('cavaliers');
    betModel.find.mockResolvedValue([bet]);
    userModel.updateOne.mockResolvedValue({});

    // Heat 100 (home), Cavs 105 (away) → cavsMargin=105-100=5, adjusted=5+3.5=8.5 > 0 → won
    const result = await service.settle('test-game-123', {
      finalHomeScore: 100,
      finalAwayScore: 105,
    });

    expect(bet.status).toBe('won');
    expect(result.adjustedMargin).toBe(8.5);
  });

  it('should mark game as finished with scores', async () => {
    const game = mockGame();
    gameModel.findOne.mockResolvedValue(game);
    betModel.find.mockResolvedValue([]);

    await service.settle('test-game-123', {
      finalHomeScore: 110,
      finalAwayScore: 105,
    });

    expect(game.status).toBe('finished');
    expect(game.finalHomeScore).toBe(110);
    expect(game.finalAwayScore).toBe(105);
    expect(game.save).toHaveBeenCalled();
  });
});
