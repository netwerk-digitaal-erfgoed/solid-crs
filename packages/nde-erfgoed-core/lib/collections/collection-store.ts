import { Store } from '../stores/store';
import { Collection } from './collection';

/**
 * A store for collections.
 */
export interface CollectionStore extends Store<Collection> {

  /**
   * Retrieves all collections where a specific string appears in one of its properties
   *
   * @param searchTerm the therm that should be present in a property
   */
  search(searchTerm: string): Promise<Collection[]>;

  /**
   * Retrieves a single collection
   *
   * @param uri The URI of the collection.
   */
  getCollection(uri: string): Promise<Collection>;

}
