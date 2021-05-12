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

  async search(searchterm: string): Promise<CollectionObject[]> {

    if (!searchterm) {

      throw new ArgumentError('Argument searchterm should be set.', searchterm);

    }

    const lowerCaseTerm = searchterm.toLowerCase();

    return this.resources.filter((resource) =>
      resource.name.toLowerCase().includes(lowerCaseTerm) ||
      resource.subject.toLowerCase().includes(lowerCaseTerm) ||
      resource.description.toLowerCase().includes(lowerCaseTerm));

  }

}
