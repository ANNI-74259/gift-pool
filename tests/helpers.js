import { InMemoryPoolRepository } from '../src/repositories/InMemoryPoolRepository.js';
import { EqualSplitStrategy } from '../src/strategies/EqualSplitStrategy.js';
import { GreedySettlementStrategy } from '../src/strategies/GreedySettlementStrategy.js';
import { BalanceCalculator } from '../src/services/BalanceCalculator.js';
import { CollectionTracker } from '../src/services/CollectionTracker.js';
import { PoolService } from '../src/services/PoolService.js';

export const buildService = (overrides = {}) => new PoolService({
  repository: new InMemoryPoolRepository(),
  splitStrategy: new EqualSplitStrategy(),
  settlementStrategy: new GreedySettlementStrategy(),
  balanceCalculator: new BalanceCalculator(),
  collectionTracker: new CollectionTracker(),
  ...overrides,
});
