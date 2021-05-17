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
   * Retrieves a single CollectionObject
   *
   * @param uri The URI of the CollectionObject
   */
  async getObject(uri: string): Promise<CollectionObject> {

    if (!uri) {

      throw new ArgumentError('Argument uri should be set.', uri);

    }

    return this.resources.find((resource) => resource.uri === uri);

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

}
