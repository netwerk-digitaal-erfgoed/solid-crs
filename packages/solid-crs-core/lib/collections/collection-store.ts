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

  /**
   * Returns the instance URI of a type registration for a given RDF class
   * or null when none was found
   *
   * @param webId The WebID of the Solid pod
   * @param forClass The forClass value of the type registration
   */
  getInstanceForClass(webId: string, forClass: string): Promise<string | undefined>;

}
