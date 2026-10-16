import { BalanceState, stateOf } from '../domain/types.js';

const pad = (text, width, right) => (right ? String(text).padStart(width) : String(text).padEnd(width));

function table(headers, rows, rightAligned = []) {
  const widths = headers.map((h, i) => Math.max(h.length, ...rows.map((r) => String(r[i]).length)));
  const line = (cells) => cells.map((c, i) => pad(c, widths[i], rightAligned.includes(i))).join('  ');
  return [line(headers), widths.map((w) => '-'.repeat(w)).join('  '), ...rows.map(line)].join('\n');
}

/** Turns a report into readable text. Knows nothing about how it was computed. */
export class ReportFormatter {
  format(report) {
    const { status, rows, transfers, names } = report;
    const out = [];

    out.push(report.name, '='.repeat(report.name.length));
    out.push(`Target    : ${status.target}`);
    out.push(`Collected : ${status.collected} (${status.percentCollected}%)`);
    out.push(status.fullyFunded
      ? `Funded    : yes${status.surplus.isPositive() ? ` (surplus ${status.surplus})` : ''}`
      : `Remaining : ${status.remaining}`);

    out.push('', 'Members');
    out.push(table(
      ['Member', 'Share', 'Paid', 'Balance', 'Status'],
      rows.map((r) => [
        r.isOrganiser ? `${r.name} (organiser)` : r.name,
        r.share.toString(),
        r.paid.toString(),
        r.balance.toString(),
        this.#statusText(r.balance),
      ]),
      [1, 2, 3],
    ));

    out.push('', 'Settle up');
    if (transfers.length === 0) {
      out.push('Nothing to settle. Everyone is square.');
    } else {
      transfers.forEach((t, i) => out.push(`${i + 1}. ${names[t.from]} pays ${names[t.to]} ${t.amount}`));
    }
    return out.join('\n');
  }

  #statusText(balance) {
    switch (stateOf(balance)) {
      case BalanceState.OWES: return `Owes ${balance.negate()}`;
      case BalanceState.OWED: return `Gets back ${balance}`;
      default: return 'Settled';
    }
  }
}
