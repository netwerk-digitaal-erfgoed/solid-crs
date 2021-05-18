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
   * Retrieves all object where a specific string appears in one of its properties
   *
   * @param searchTerm the therm that should be present in a property
   */
  search(searchTerm: string): Promise<CollectionObject[]>;

  /**
   * Retrieves a single CollectionObject
   *
   * @param uri The URI of the CollectionObject
   */
  getObject(uri: string): Promise<CollectionObject>;

}
