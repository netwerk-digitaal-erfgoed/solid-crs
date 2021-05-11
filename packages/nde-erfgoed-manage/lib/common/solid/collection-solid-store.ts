import { getSolidDataset, getStringWithLocale, getThing } from '@digita-ai/nde-erfgoed-client';
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
  async delete(collection: Collection): Promise<Collection> {

    const result = await fetch(collection.uri, { method: 'DELETE' });

    if (!result.ok) {

      throw new Error('Error while deleting');

    }

    return collection;

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

    const dataset = await getSolidDataset(uri);

    const collectionThing = getThing(dataset, uri);

    return {
      uri,
      name: getStringWithLocale(collectionThing, 'http://schema.org/name', 'nl'),
      description: getStringWithLocale(collectionThing, 'http://schema.org/description', 'nl'),
    };

  }

}
