import { Money } from '../domain/Money.js';

export class CollectionTracker {
  status(pool) {
    const target = pool.target;
    const collected = pool.totalCollected();
    const diff = target.subtract(collected);
    return Object.freeze({
      target,
      collected,
      remaining: diff.isPositive() ? diff : Money.zero(),
      surplus: diff.isNegative() ? diff.negate() : Money.zero(),
      fullyFunded: !diff.isPositive(),
      percentCollected: Math.round((collected.paise * 1000) / target.paise) / 10,
    });
  }
}
