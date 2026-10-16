/** Immutable money value object. Stores integer paise to avoid float drift. */
export class Money {
  #paise;

  constructor(paise) {
    if (!Number.isSafeInteger(paise)) {
      throw new TypeError(`Money needs an integer number of paise, got ${paise}`);
    }
    this.#paise = paise;
    Object.freeze(this);
  }

  static zero() { return new Money(0); }
  static fromPaise(paise) { return new Money(paise); }
  static fromRupees(rupees) {
    if (typeof rupees !== 'number' || !Number.isFinite(rupees)) {
      throw new TypeError(`Rupees must be a finite number, got ${rupees}`);
    }
    return new Money(Math.round(rupees * 100));
  }
  static sum(list) { return list.reduce((acc, m) => acc.add(m), Money.zero()); }

  get paise() { return this.#paise; }

  add(other) { return new Money(this.#paise + other.paise); }
  subtract(other) { return new Money(this.#paise - other.paise); }
  negate() { return new Money(-this.#paise); }
  isZero() { return this.#paise === 0; }
  isPositive() { return this.#paise > 0; }
  isNegative() { return this.#paise < 0; }
  equals(other) { return this.#paise === other.paise; }
  compareTo(other) { return Math.sign(this.#paise - other.paise); }
  min(other) { return this.#paise <= other.paise ? this : other; }
  max(other) { return this.#paise >= other.paise ? this : other; }

  toString() {
    const abs = Math.abs(this.#paise);
    const rupees = Math.trunc(abs / 100);
    const paise = abs % 100;
    const body = rupees.toLocaleString('en-IN') + (paise ? `.${String(paise).padStart(2, '0')}` : '');
    return `${this.#paise < 0 ? '-' : ''}₹${body}`;
  }
}
