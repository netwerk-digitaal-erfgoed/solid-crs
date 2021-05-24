import { Store } from '../stores/store';
import { Collection } from './collection';
import { CollectionObject } from './collection-object';

/**
 * A store for collection objects.
 */
export interface CollectionObjectStore extends Store<CollectionObject> {

  /**
   * Retrieves all objects for a specific collection.
   *
   * @param collection The collection for which to retrieve objects.
   */
  getObjectsForCollection(collection: Collection): Promise<CollectionObject[]>;

  /**
   * Searches objects based on a search term.
   *
   * @param searchTerm The term to search for.
   * @param objects The objects to search through.
   * @returns The objects which match the search term.
   */
  search(searchTerm: string, objects: CollectionObject[]): Promise<CollectionObject[]>;

}
