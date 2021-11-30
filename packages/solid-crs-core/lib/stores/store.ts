import { Resource } from './resource';

/**
 * Represents a store of resources.
 */
export interface Store<T extends Resource> {
  /**
   * Returns all resources on the store.
   */
  all(): Promise<T[]>;

  /**
   * Either deletes the given resource.
   *
   * @param resource Resource to be deleted.
   */
  delete(resource: T): Promise<T>;

  /**
   * Either creates or updates the given resource.
   *
   * @param resource Resource to be saved.
   */
  save(resource: T): Promise<T>;

  /**
   * Get a resource by its uri
   *
   * @param uri uri of the resource
   */
  get(uri: string): Promise<T | undefined>;

}
