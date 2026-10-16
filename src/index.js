import { InMemoryPoolRepository } from './repositories/InMemoryPoolRepository.js';
import { EqualSplitStrategy } from './strategies/EqualSplitStrategy.js';
import { GreedySettlementStrategy } from './strategies/GreedySettlementStrategy.js';
import { BalanceCalculator } from './services/BalanceCalculator.js';
import { CollectionTracker } from './services/CollectionTracker.js';
import { PoolService } from './services/PoolService.js';
import { ReportFormatter } from './presentation/ReportFormatter.js';

// Composition root: the only place that knows which concrete classes are used.
const service = new PoolService({
  repository: new InMemoryPoolRepository(),
  splitStrategy: new EqualSplitStrategy(),
  settlementStrategy: new GreedySettlementStrategy(),
  balanceCalculator: new BalanceCalculator(),
  collectionTracker: new CollectionTracker(),
});
const formatter = new ReportFormatter();

// Demo: the farewell-gift scenario (any target, organiser and members work).
const poolId = service.createPool({
  name: 'Farewell gift for the manager',
  target: 6000,
  organiser: 'Asha',
  members: ['Bharat', 'Chitra', 'Dev', 'Esha', 'Farhan', 'Gita', 'Harsh'],
});

service.recordPayment(poolId, 'Asha', 750);                           // paid in full
service.recordPayment(poolId, 'Bharat', 750);                         // paid in full
service.recordPayment(poolId, 'Chitra', 750);                         // paid in full
service.recordPayment(poolId, 'Dev', 400);                            // partial
service.recordPayment(poolId, 'Esha', 300);                           // partial
service.recordPayment(poolId, 'Farhan', 1500, 'own share + Gita');    // generous: covered a friend
// Gita and Harsh haven't paid yet.

console.log(formatter.format(service.getReport(poolId)));

const dev = service.getMemberBalance(poolId, 'Dev');
console.log(`\n"How much does Dev still owe?" -> ${dev.balance.negate()}`);
