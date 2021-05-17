import { Store } from '../stores/store';
import { Collection } from './collection';

/**
 * A store for collections.
 */
export interface CollectionStore extends Store<Collection> {

  /**
   * Retrieves a single collection
   *
   * @param uri The URI of the collection.
   */
  getCollection(uri: string): Promise<Collection>;
}
