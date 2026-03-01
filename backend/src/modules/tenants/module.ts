import { InMemoryTenantsRepository } from './infrastructure/persistence/InMemoryTenantsRepository';
import { MongoTenantsRepository } from './infrastructure/persistence/MongoTenantsRepository';

export function createTenantsRepository({ useMongo = false }: { useMongo?: boolean }) {
  return useMongo ? new MongoTenantsRepository() : new InMemoryTenantsRepository();
}
