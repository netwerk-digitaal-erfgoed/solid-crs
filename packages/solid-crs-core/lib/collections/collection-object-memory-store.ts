import { fulltextMatch } from '../utils/fulltext-match';
import { ArgumentError } from '../errors/argument-error';
import { MemoryStore } from '../stores/memory-store';
import { Collection } from './collection';
import { CollectionObject } from './collection-object';
import { CollectionObjectStore } from './collection-object-store';

export class CollectionObjectMemoryStore extends MemoryStore<CollectionObject> implements CollectionObjectStore {

  /**
   * Instantiates a collection object memory store.
   *
   * @param resources An array of collection objects to initially populate the store.
   */
  constructor(resources: CollectionObject[]) {

    super(resources);

  }

  /**
   * Retrieves all objects for a specific collection.
   *
   * @param collection The collection for which to retrieve objects.
   */
  async getObjectsForCollection(collection: Collection): Promise<CollectionObject[]> {

    if (!collection) {

      throw new ArgumentError('Argument collection should be set.', collection);

    }

    if (!this.resources) {

      throw new ArgumentError('Argument this.resources should be set.', this.resources);

    }

    return this.resources.filter((resource) => resource.collection === collection.uri);

  }

  /**
   * Searches objects based on a search term.
   *
   * @param searchTerm The term to search for.
   * @param objects The objects to search through.
   * @returns The objects which match the search term.
   */
  async search(searchTerm: string, objects: CollectionObject[]): Promise<CollectionObject[]> {

    if (!searchTerm) {

      throw new ArgumentError('Argument searchTerm should be set.', searchTerm);

    }

    if (!objects) {

      throw new ArgumentError('Argument objects should be set.', objects);

    }

    return objects.filter((object) => fulltextMatch(object, searchTerm));

  }

}
