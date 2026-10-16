import test from 'node:test';
import assert from 'node:assert/strict';
import { Money } from '../src/domain/Money.js';
import { GreedySettlementStrategy } from '../src/strategies/GreedySettlementStrategy.js';

const account = (id, paise, extra = {}) => ({ id, balance: Money.fromPaise(paise), ...extra });

function applyTransfers(accounts, transfers) {
  const net = new Map(accounts.map((a) => [a.id, a.balance.paise]));
  for (const t of transfers) {
    net.set(t.from, net.get(t.from) + t.amount.paise); // payer's debt shrinks
    net.set(t.to, net.get(t.to) - t.amount.paise);     // receiver's credit shrinks
  }
  return net;
}

test('simple match: one debtor, one creditor', () => {
  const t = new GreedySettlementStrategy().settle([account('a', -500), account('b', 500)]);
  assert.equal(t.length, 1);
  assert.deepEqual([t[0].from, t[0].to, t[0].amount.paise], ['a', 'b', 500]);
});

test('nothing to settle when everyone is square', () => {
  assert.deepEqual(new GreedySettlementStrategy().settle([account('a', 0), account('b', 0)]), []);
});

test('rejects balances that do not sum to zero', () => {
  assert.throws(() => new GreedySettlementStrategy().settle([account('a', -100), account('b', 50)]), /sum to zero/);
});

test('settleLast accounts are matched after real people', () => {
  const t = new GreedySettlementStrategy().settle([
    account('gita', -750), account('farhan', 750), account('pool', 1000, { settleLast: true }), account('harsh', -1000),
  ]);
  assert.deepEqual(t.map((x) => [x.from, x.to, x.amount.paise]),
    [['harsh', 'farhan', 750], ['harsh', 'pool', 250], ['gita', 'pool', 750]]);
});

test('property: transfers zero every balance using at most n-1 transfers', () => {
  let seed = 42;
  const rand = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
  for (let run = 0; run < 200; run++) {
    const n = 2 + Math.floor(rand() * 10);
    const values = Array.from({ length: n - 1 }, () => Math.round((rand() - 0.5) * 20000));
    values.push(-values.reduce((a, b) => a + b, 0));
    const accounts = values.map((v, i) => account(`a${i}`, v));
    const transfers = new GreedySettlementStrategy().settle(accounts);
    assert.ok(transfers.length <= n - 1);
    assert.ok([...applyTransfers(accounts, transfers).values()].every((v) => v === 0));
  }
});
