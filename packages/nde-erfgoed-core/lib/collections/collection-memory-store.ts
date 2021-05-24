import { fulltextMatch } from '../utils/fulltext-match';
import { ArgumentError } from '../errors/argument-error';
import { MemoryStore } from '../stores/memory-store';
import { Collection } from './collection';
import { CollectionStore } from './collection-store';

export class CollectionMemoryStore extends MemoryStore<Collection> implements CollectionStore {

  /**
   * Instantiates a collection object memory store.
   *
   * @param resources An array of collection objects to initially populate the store.
   */
  constructor(resources: Collection[]) {

    super(resources);

  }

  /**
   * Searches collections based on a search term.
   *
   * @param searchTerm The term to search for.
   * @param collections The collections to search through.
   * @returns The collections which match the search term.
   */
  async search(searchTerm: string, collections: Collection[]): Promise<Collection[]> {

    if (!searchTerm) {

      throw new ArgumentError('Argument searchTerm should be set.', searchTerm);

    }

    if (!collections) {

      throw new ArgumentError('Argument collections should be set.', collections);

    }

    return collections.filter((collection) => fulltextMatch(collection, searchTerm));

  }

}
