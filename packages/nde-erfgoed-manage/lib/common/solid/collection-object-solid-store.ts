import { MemoryStore, CollectionObject, CollectionObjectStore, Collection } from '@digita-ai/nde-erfgoed-core';

export class CollectionObjectMemoryStore extends MemoryStore<CollectionObject> implements CollectionObjectStore {

  /**
   * Retrieves all objects for a specific collection.
   *
   * @param collection The collection for which to retrieve objects.
   */
  getObjectsForCollection(collection: Collection): Promise<CollectionObject[]> {

    throw new Error('Method not implemented.');

  }

  /**
   * Retrieves a single Collection
   *
   * @param uri The URI of the Collection
   */
  getObject(uri: string): Promise<CollectionObject> {

    throw new Error('Method not implemented.');

  }

  /**
   * Retrieves a list of collections for a given WebID
   *
   * @param webId The WebID to retreive Collections from
   */
  async all(): Promise<CollectionObject[]> {

    return [];

  }

  /**
   * Deletes a single Collection from a pod
   *
   * @param resource The Collection to delete
   */
  delete(resource: CollectionObject): Promise<CollectionObject> {

    throw new Error('Method not implemented.');

  }

  /**
   * Stores a single Collection to a pod
   *
   * @param resource The Collection to save
   */
  save(resource: CollectionObject): Promise<CollectionObject> {

    throw new Error('Method not implemented.');

  }

}
