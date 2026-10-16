import test from 'node:test';
import assert from 'node:assert/strict';
import { buildService } from './helpers.js';
import { ReportFormatter } from '../src/presentation/ReportFormatter.js';

function briefScenario() {
  const service = buildService();
  const id = service.createPool({
    name: 'Gift', target: 6000, organiser: 'Asha',
    members: ['Bharat', 'Chitra', 'Dev', 'Esha', 'Farhan', 'Gita', 'Harsh'],
  });
  [['Asha', 750], ['Bharat', 750], ['Chitra', 750], ['Dev', 400], ['Esha', 300], ['Farhan', 1500]]
    .forEach(([who, amt]) => service.recordPayment(id, who, amt));
  return { service, id };
}

test('brief scenario: shares, balances and collection status', () => {
  const { service, id } = briefScenario();
  const report = service.getReport(id);
  assert.ok(report.rows.every((r) => r.share.paise === 75000));
  assert.equal(service.getMemberBalance(id, 'Dev').balance.paise, -35000);
  assert.equal(service.getMemberBalance(id, 'Farhan').balance.paise, 75000);
  assert.equal(report.status.collected.paise, 445000);
  assert.equal(report.status.remaining.paise, 155000);
  assert.equal(report.status.fullyFunded, false);
});

test('brief scenario: settlement list', () => {
  const { service, id } = briefScenario();
  const lines = service.getReport(id).transfers.map((t) => `${t.from}>${t.to}:${t.amount.paise / 100}`);
  assert.deepEqual(lines, ['gita>farhan:750', 'harsh>__pool__:750', 'esha>__pool__:450', 'dev>__pool__:350']);
});

test('surplus: the pool refunds people who overpaid', () => {
  const service = buildService();
  const id = service.createPool({ name: 'G', target: 1000, organiser: 'A', members: ['B'] });
  service.recordPayment(id, 'A', 800);
  service.recordPayment(id, 'B', 700);
  const report = service.getReport(id);
  assert.equal(report.status.surplus.paise, 50000);
  assert.equal(report.status.fullyFunded, true);
  assert.deepEqual(report.transfers.map((t) => `${t.from}>${t.to}:${t.amount.paise / 100}`),
    ['__pool__>a:300', '__pool__>b:200']);
});

test('everyone exactly paid: nothing to settle', () => {
  const service = buildService();
  const id = service.createPool({ name: 'G', target: 300, organiser: 'A', members: ['B', 'C'] });
  ['A', 'B', 'C'].forEach((n) => service.recordPayment(id, n, 100));
  assert.equal(service.getReport(id).transfers.length, 0);
});

test('adding and removing members recomputes shares', () => {
  const service = buildService();
  const id = service.createPool({ name: 'G', target: 900, organiser: 'A', members: ['B', 'C'] });
  assert.equal(service.getMemberBalance(id, 'A').share.paise, 30000);
  service.removeMember(id, 'C');
  assert.equal(service.getMemberBalance(id, 'A').share.paise, 45000);
  service.addMember(id, 'D');
  assert.equal(service.getMemberBalance(id, 'A').share.paise, 30000);
});

test('multiple payments by one member add up', () => {
  const service = buildService();
  const id = service.createPool({ name: 'G', target: 200, organiser: 'A', members: ['B'] });
  service.recordPayment(id, 'B', 30);
  service.recordPayment(id, 'b', 20); // case-insensitive reference
  assert.equal(service.getMemberBalance(id, 'B').paid.paise, 5000);
});

test('validation rules', () => {
  const service = buildService();
  const id = service.createPool({ name: 'G', target: 200, organiser: 'A', members: ['B'] });
  assert.throws(() => service.recordPayment(id, 'A', 0), /greater than zero/);
  assert.throws(() => service.recordPayment(id, 'A', -5), /greater than zero/);
  assert.throws(() => service.recordPayment(id, 'Zed', 10), /not a member/);
  assert.throws(() => service.addMember(id, 'b'), /already in the pool/);
  assert.throws(() => service.removeMember(id, 'A'), /organiser/);
  service.recordPayment(id, 'B', 10);
  assert.throws(() => service.removeMember(id, 'B'), /already paid/);
  assert.throws(() => service.createPool({ name: 'X', target: 0, organiser: 'A' }), /Target/);
  assert.throws(() => service.getReport('nope'), /not found/);
});

test('formatter renders the report', () => {
  const { service, id } = briefScenario();
  const text = new ReportFormatter().format(service.getReport(id));
  assert.match(text, /Remaining : ₹1,550/);
  assert.match(text, /Gita pays Farhan ₹750/);
  assert.match(text, /Asha \(organiser\)/);
});
