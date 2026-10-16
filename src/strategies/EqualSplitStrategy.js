import { Money } from '../domain/Money.js';
import { DomainError } from '../domain/types.js';
import { SplitStrategy } from './SplitStrategy.js';

/** Equal shares. Leftover paise go one each to the first members (stable order). */
export class EqualSplitStrategy extends SplitStrategy {
  split(target, memberIds) {
    const n = memberIds.length;
    if (n === 0) throw new DomainError('Cannot split among zero members');
    const base = Math.floor(target.paise / n);
    const remainder = target.paise % n;
    const shares = new Map();
    memberIds.forEach((id, i) => shares.set(id, Money.fromPaise(base + (i < remainder ? 1 : 0))));
    return shares;
  }
}
