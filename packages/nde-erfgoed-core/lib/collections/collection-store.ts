import { Store } from '../stores/store';
import { Collection } from './collection';

/**
 * A store for collections.
 */
export interface CollectionStore extends Store<Collection> {

  getCollection(uri: string): Promise<Collection>;
}
