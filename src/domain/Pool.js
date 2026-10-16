import { Money } from './Money.js';
import { DomainError } from './types.js';

/** Aggregate root: holds members and payments, enforces rules about itself only. */
export class Pool {
  #target;
  #members = new Map();
  #payments = [];

  constructor({ id, name, target, organiser }) {
    if (!id) throw new DomainError('Pool needs an id');
    if (typeof name !== 'string' || !name.trim()) throw new DomainError('Pool needs a name');
    if (!organiser) throw new DomainError('Pool needs an organiser');
    this.id = id;
    this.name = name.trim();
    this.organiserId = organiser.id;
    this.changeTarget(target);
    this.addMember(organiser); // organiser is always a member
  }

  get target() { return this.#target; }
  get members() { return [...this.#members.values()]; }
  get memberIds() { return [...this.#members.keys()]; }
  get payments() { return [...this.#payments]; }

  changeTarget(target) {
    if (!(target instanceof Money) || !target.isPositive()) {
      throw new DomainError('Target must be greater than zero');
    }
    this.#target = target;
  }

  addMember(member) {
    if (this.#members.has(member.id)) throw new DomainError(`"${member.name}" is already in the pool`);
    this.#members.set(member.id, member);
  }

  removeMember(memberId) {
    this.#assertMember(memberId);
    if (memberId === this.organiserId) throw new DomainError('The organiser cannot be removed');
    if (this.totalPaidBy(memberId).isPositive()) {
      throw new DomainError('This member has already paid; refund them before removing');
    }
    this.#members.delete(memberId);
  }

  /** Accepts an id or a case-insensitive name. */
  requireMember(ref) {
    const key = String(ref).trim().toLowerCase();
    const found = this.members.find((m) => m.id === key || m.name.toLowerCase() === key);
    if (!found) throw new DomainError(`"${ref}" is not a member of this pool`);
    return found;
  }

  recordPayment(payment) {
    this.#assertMember(payment.memberId);
    this.#payments.push(payment);
  }

  totalPaidBy(memberId) {
    return Money.sum(this.#payments.filter((p) => p.memberId === memberId).map((p) => p.amount));
  }

  totalCollected() {
    return Money.sum(this.#payments.map((p) => p.amount));
  }

  #assertMember(memberId) {
    if (!this.#members.has(memberId)) throw new DomainError(`Unknown member "${memberId}"`);
  }
}
