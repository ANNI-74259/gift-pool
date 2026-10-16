import { randomUUID } from 'node:crypto';
import { Money } from '../domain/Money.js';
import { Member } from '../domain/Member.js';
import { Payment } from '../domain/Payment.js';
import { Pool } from '../domain/Pool.js';
import { DomainError, POOL_ACCOUNT_ID } from '../domain/types.js';

const toMoney = (value) => (value instanceof Money ? value : Money.fromRupees(value));

/** Orchestrates use-cases. Depends only on abstractions injected from outside. */
export class PoolService {
  #repository;
  #splitStrategy;
  #settlementStrategy;
  #balanceCalculator;
  #collectionTracker;
  #idGenerator;

  constructor({
    repository, splitStrategy, settlementStrategy, balanceCalculator, collectionTracker,
    idGenerator = () => randomUUID(),
  }) {
    this.#repository = repository;
    this.#splitStrategy = splitStrategy;
    this.#settlementStrategy = settlementStrategy;
    this.#balanceCalculator = balanceCalculator;
    this.#collectionTracker = collectionTracker;
    this.#idGenerator = idGenerator;
  }

  /** target in rupees (or Money); organiser and members are names. Returns the pool id. */
  createPool({ name, target, organiser, members = [] }) {
    const pool = new Pool({
      id: this.#idGenerator(),
      name,
      target: toMoney(target),
      organiser: Member.fromName(organiser),
    });
    members.forEach((m) => pool.addMember(Member.fromName(m)));
    this.#repository.save(pool);
    return pool.id;
  }

  addMember(poolId, name) {
    const pool = this.#pool(poolId);
    pool.addMember(Member.fromName(name));
    this.#repository.save(pool);
  }

  removeMember(poolId, memberRef) {
    const pool = this.#pool(poolId);
    pool.removeMember(pool.requireMember(memberRef).id);
    this.#repository.save(pool);
  }

  changeTarget(poolId, target) {
    const pool = this.#pool(poolId);
    pool.changeTarget(toMoney(target));
    this.#repository.save(pool);
  }

  recordPayment(poolId, memberRef, amount, note = '') {
    const pool = this.#pool(poolId);
    const member = pool.requireMember(memberRef);
    pool.recordPayment(new Payment({ memberId: member.id, amount: toMoney(amount), note }));
    this.#repository.save(pool);
  }

  /** "How much do I still owe?" */
  getMemberBalance(poolId, memberRef) {
    const report = this.getReport(poolId);
    const member = this.#pool(poolId).requireMember(memberRef);
    return report.rows.find((r) => r.memberId === member.id);
  }

  /** Everything the organiser needs: shares, balances, collection status, settlements. */
  getReport(poolId) {
    const pool = this.#pool(poolId);
    const shares = this.#splitStrategy.split(pool.target, pool.memberIds);
    const balances = this.#balanceCalculator.calculate(pool, shares);
    const status = this.#collectionTracker.status(pool);
    const accounts = this.#balanceCalculator.settlementAccounts(balances, pool);
    const transfers = this.#settlementStrategy.settle(accounts);

    const names = { [POOL_ACCOUNT_ID]: 'the Pool' };
    pool.members.forEach((m) => { names[m.id] = m.name; });
    const rows = balances.map((b) => ({
      ...b,
      name: names[b.memberId],
      isOrganiser: b.memberId === pool.organiserId,
    }));

    return Object.freeze({ poolId: pool.id, name: pool.name, organiserId: pool.organiserId, rows, status, transfers, names });
  }

  #pool(poolId) {
    const pool = this.#repository.findById(poolId);
    if (!pool) throw new DomainError(`Pool "${poolId}" not found`);
    return pool;
  }
}
