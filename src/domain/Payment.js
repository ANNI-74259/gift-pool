import { Money } from './Money.js';
import { DomainError } from './types.js';

export class Payment {
  constructor({ memberId, amount, note = '', paidAt = new Date() }) {
    if (!memberId) throw new DomainError('Payment needs a member');
    if (!(amount instanceof Money) || !amount.isPositive()) {
      throw new DomainError('Payment amount must be greater than zero');
    }
    this.memberId = memberId;
    this.amount = amount;
    this.note = note;
    this.paidAt = paidAt;
    Object.freeze(this);
  }
}
