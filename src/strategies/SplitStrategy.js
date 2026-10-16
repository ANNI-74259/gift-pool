import { Money } from '../domain/Money.js';
import { DomainError } from '../domain/types.js';

/** Contract: split(target: Money, memberIds: string[]) -> Map<memberId, Money> summing exactly to target. */
export class SplitStrategy {
  // eslint-disable-next-line no-unused-vars
  split(target, memberIds) {
    throw new Error('SplitStrategy.split() must be implemented');
  }
}

/** Liskov guard: every strategy's output must honour the contract. */
export function assertValidSplit(shares, target, memberIds) {
  for (const id of memberIds) {
    if (!shares.has(id)) throw new DomainError(`Split is missing a share for "${id}"`);
  }
  const total = Money.sum([...shares.values()]);
  if (!total.equals(target)) {
    throw new DomainError(`Shares add up to ${total}, expected ${target}`);
  }
}
