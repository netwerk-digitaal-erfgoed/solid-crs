import { NotImplementedError } from '../errors/not-implemented-error';
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
  getObjectsForCollection(collection: Collection): Promise<CollectionObject[]> {

    throw new NotImplementedError();

  }

}
