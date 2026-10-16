import test from 'node:test';
import assert from 'node:assert/strict';
import { Money } from '../src/domain/Money.js';

test('rupees convert to integer paise without float drift', () => {
  assert.equal(Money.fromRupees(0.1).add(Money.fromRupees(0.2)).paise, 30);
  assert.equal(Money.fromRupees(857.14).paise, 85714);
});

test('arithmetic and comparisons', () => {
  const a = Money.fromRupees(10);
  const b = Money.fromRupees(4);
  assert.equal(a.subtract(b).paise, 600);
  assert.equal(b.subtract(a).isNegative(), true);
  assert.equal(a.compareTo(b), 1);
  assert.equal(Money.sum([a, b]).paise, 1400);
});

test('formats with Indian grouping and optional paise', () => {
  assert.equal(Money.fromRupees(750).toString(), '₹750');
  assert.equal(Money.fromRupees(123456.5).toString(), '₹1,23,456.50');
  assert.equal(Money.fromRupees(-350).toString(), '-₹350');
});

test('rejects non-integer paise and non-numbers', () => {
  assert.throws(() => Money.fromPaise(1.5), TypeError);
  assert.throws(() => Money.fromRupees('10'), TypeError);
});
