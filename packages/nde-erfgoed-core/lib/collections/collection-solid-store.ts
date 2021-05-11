import { Collection } from './collection';
import { CollectionStore } from './collection-store';

/**
 * A store for collections.
 */
export class CollectionSolidStore implements CollectionStore {

  /**
   * Retrieves a list of collections for a given WebID
   *
   * @param webId The WebID to retreive Collections from
   */
  all(): Promise<Collection[]> {

    throw new Error('Method not implemented.');

  }

  /**
   * Deletes a single Collection from a pod
   *
   * @param resource The Collection to delete
   */
  delete(resource: Collection): Promise<Collection> {

    throw new Error('Method not implemented.');

  }

  /**
   * Stores a single Collection to a pod
   *
   * @param resource The Collection to save
   */
  save(resource: Collection): Promise<Collection> {

    throw new Error('Method not implemented.');

  }

  /**
   * Retrieves a single Collection
   *
   * @param uri The URI of the Collection
   */
  getCollection(uri: string): Promise<Collection> {

    throw new Error('Method not implemented.');

  }

}
