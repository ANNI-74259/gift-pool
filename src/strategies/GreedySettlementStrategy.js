import { Money } from '../domain/Money.js';
import { DomainError, createTransfer } from '../domain/types.js';
import { SettlementStrategy } from './SettlementStrategy.js';

/**
 * Greedy matching: biggest debtor pays biggest creditor min(debt, credit).
 * Produces at most (accounts - 1) transfers. Accounts flagged `settleLast`
 * (the virtual pool) are matched after real people, so friends reimburse
 * friends first.
 */
export class GreedySettlementStrategy extends SettlementStrategy {
  settle(accounts) {
    const total = accounts.reduce((sum, a) => sum + a.balance.paise, 0);
    if (total !== 0) throw new DomainError('Balances must sum to zero before settling');

    const debtors = this.#side(accounts, (a) => a.balance.isNegative(), -1);
    const creditors = this.#side(accounts, (a) => a.balance.isPositive(), 1);

    const transfers = [];
    let d = 0;
    let c = 0;
    while (d < debtors.length && c < creditors.length) {
      const amount = Math.min(debtors[d].remaining, creditors[c].remaining);
      transfers.push(createTransfer({
        from: debtors[d].id,
        to: creditors[c].id,
        amount: Money.fromPaise(amount),
      }));
      debtors[d].remaining -= amount;
      creditors[c].remaining -= amount;
      if (debtors[d].remaining === 0) d++;
      if (creditors[c].remaining === 0) c++;
    }
    return transfers;
  }

  #side(accounts, belongs, sign) {
    return accounts
      .filter(belongs)
      .map((a) => ({ id: a.id, remaining: sign * a.balance.paise, last: Number(Boolean(a.settleLast)) }))
      .sort((x, y) => x.last - y.last || y.remaining - x.remaining || x.id.localeCompare(y.id));
  }
}
