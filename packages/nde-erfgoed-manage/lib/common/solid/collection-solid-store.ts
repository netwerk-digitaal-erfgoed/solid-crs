import { getSolidDataset, getStringNoLocale, getThing } from '@digita-ai/nde-erfgoed-client';
import { Collection, CollectionStore } from '@digita-ai/nde-erfgoed-core';

/**
 * A store for collections.
 */
export class CollectionSolidStore implements CollectionStore {

  constructor(private webId: string) { }

  /**
   * Retrieves a list of collections for a given WebID
   *
   */
  async all(): Promise<Collection[]> {

    return [ await this.getCollection('http://localhost:3000/leapeeters/heritage-collections/collection-1') ];

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
  async getCollection(uri: string): Promise<Collection> {

    const dataset = await getSolidDataset('http://localhost:3000/leapeeters/heritage-collections/collection-1');

    const collectionThing = getThing(dataset, 'http://localhost:3000/leapeeters/heritage-collections/collection-1');

    return {
      uri,
      name: getStringNoLocale(collectionThing, 'http://schema.org/name'),
      description: getStringNoLocale(collectionThing, 'http://schema.org/description'),
    };

  }

}
