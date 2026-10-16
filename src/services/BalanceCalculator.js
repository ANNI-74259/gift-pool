import { POOL_ACCOUNT_ID, createBalance } from '../domain/types.js';
import { assertValidSplit } from '../strategies/SplitStrategy.js';

export class BalanceCalculator {
  /** One row per member: share, paid, balance (= paid - share). */
  calculate(pool, shares) {
    assertValidSplit(shares, pool.target, pool.memberIds);
    return pool.members.map((m) =>
      createBalance({ memberId: m.id, share: shares.get(m.id), paid: pool.totalPaidBy(m.id) }));
  }

  /**
   * Adds the virtual pool account (target - collected) so all balances sum to zero:
   * shortfall -> pool is owed money, surplus -> pool owes refunds.
   */
  settlementAccounts(balances, pool) {
    const accounts = balances.map((b) => ({ id: b.memberId, balance: b.balance }));
    const poolBalance = pool.target.subtract(pool.totalCollected());
    if (!poolBalance.isZero()) {
      accounts.push({ id: POOL_ACCOUNT_ID, balance: poolBalance, settleLast: true });
    }
    return accounts;
  }
}
