import { Observable, of } from 'rxjs';
import { Resource } from './resource';
import { Store } from './store';

/**
 * An implementation of a generic store which stores resources in-memory. Useful for mocking.
 */
export class MemoryStore<T extends Resource> implements Store<T> {

  /**
   * Instantiates a memory store.
   *
   * @param resources An array of resources to initially populate the store.
   */
  constructor(private resources: T[]) { }

  /**
   * Returns all resources stored in-memory.
   *
   * @returns All resources stores in-memory.
   */
  all(): Observable<T[]> {

    return of(this.resources);

  }

}
