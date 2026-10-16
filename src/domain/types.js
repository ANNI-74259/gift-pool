import { Money } from './Money.js';

/** Id of the virtual account that absorbs any shortfall/surplus so balances sum to zero. */
export const POOL_ACCOUNT_ID = '__pool__';

export class DomainError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DomainError';
  }
}

/** balance = paid - share. Negative: owes. Positive: is owed. Zero: settled. */
export const createBalance = ({ memberId, share, paid }) =>
  Object.freeze({ memberId, share, paid, balance: paid.subtract(share) });

export const createTransfer = ({ from, to, amount }) => {
  if (!(amount instanceof Money) || !amount.isPositive()) {
    throw new DomainError('A transfer amount must be positive');
  }
  return Object.freeze({ from, to, amount });
};

export const BalanceState = Object.freeze({ OWES: 'OWES', OWED: 'OWED', SETTLED: 'SETTLED' });

export const stateOf = (balance) =>
  balance.isNegative() ? BalanceState.OWES : balance.isPositive() ? BalanceState.OWED : BalanceState.SETTLED;
