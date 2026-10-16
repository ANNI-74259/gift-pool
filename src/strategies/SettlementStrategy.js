/**
 * Contract: settle(accounts) where accounts = [{ id, balance: Money, settleLast?: boolean }]
 * and balances sum to zero. Returns [{ from, to, amount }] that bring every balance to zero.
 */
export class SettlementStrategy {
  // eslint-disable-next-line no-unused-vars
  settle(accounts) {
    throw new Error('SettlementStrategy.settle() must be implemented');
  }
}
