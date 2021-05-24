import { Store } from '../stores/store';
import { Collection } from './collection';

/**
 * A store for collections.
 */
export interface CollectionStore extends Store<Collection> {

  /**
   * Searches collections based on a search term.
   *
   * @param searchTerm The term to search for.
   * @param collections The collections to search through.
   * @returns The collections which match the search term.
   */
  search(searchTerm: string, collections: Collection[]): Promise<Collection[]>;

}
