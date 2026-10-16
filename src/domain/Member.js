import { DomainError } from './types.js';

export class Member {
  constructor({ id, name }) {
    if (typeof name !== 'string' || !name.trim()) throw new DomainError('Member needs a name');
    if (typeof id !== 'string' || !id.trim()) throw new DomainError('Member needs an id');
    this.id = id;
    this.name = name.trim();
    Object.freeze(this);
  }

  /** "Asha K." -> "asha-k" */
  static idFromName(name) {
    const id = String(name).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (!id) throw new DomainError('Member name must contain letters or digits');
    return id;
  }

  static fromName(name) {
    return new Member({ id: Member.idFromName(name), name });
  }
}
