import test from 'node:test';
import assert from 'node:assert/strict';
import { Money } from '../src/domain/Money.js';
import { EqualSplitStrategy } from '../src/strategies/EqualSplitStrategy.js';
import { assertValidSplit } from '../src/strategies/SplitStrategy.js';

const ids = (n) => Array.from({ length: n }, (_, i) => `m${i}`);

test('divides evenly when possible', () => {
  const shares = new EqualSplitStrategy().split(Money.fromRupees(6000), ids(8));
  assert.ok([...shares.values()].every((s) => s.paise === 75000));
});

test('uneven split: leftover paise go to the first members', () => {
  const shares = new EqualSplitStrategy().split(Money.fromRupees(6000), ids(7));
  assert.deepEqual([...shares.values()].map((s) => s.paise),
    [85715, 85715, 85714, 85714, 85714, 85714, 85714]);
});

test('contract: shares always sum exactly to the target', () => {
  const strategy = new EqualSplitStrategy();
  for (const target of [1, 99, 6000, 6001, 123457]) {
    for (let n = 1; n <= 13; n++) {
      const money = Money.fromPaise(target);
      assertValidSplit(strategy.split(money, ids(n)), money, ids(n)); // throws on violation
    }
  }
});

test('cannot split among zero members', () => {
  assert.throws(() => new EqualSplitStrategy().split(Money.fromRupees(10), []), /zero members/);
});
