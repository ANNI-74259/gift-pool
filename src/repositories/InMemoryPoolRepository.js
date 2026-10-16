import { PoolRepository } from './PoolRepository.js';

export class InMemoryPoolRepository extends PoolRepository {
  #pools = new Map();
  save(pool) { this.#pools.set(pool.id, pool); }
  findById(id) { return this.#pools.get(id); }
}
