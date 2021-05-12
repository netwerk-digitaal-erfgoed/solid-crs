import { Store } from '../stores/store';
import { Collection } from './collection';

/**
 * A store for collection objects.
 */
export interface CollectionStore extends Store<Collection> {

  /**
   * Retrieves all collections where a specific string appears in one of its properties
   *
   * @param searchterm the therm that should be present in a property
   */
  search(searchterm: string): Promise<Collection[]>;

}
