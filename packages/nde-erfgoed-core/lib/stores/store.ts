import { Observable } from 'rxjs';
import { Resource } from './resource';

/**
 * Represents a store of resources.
 */
export interface Store<T extends Resource> {
  /**
   * Returns all resources on the store.
   */
  all(): Observable<T[]>;
}
