import { CallTracker } from 'assert';
import { getSolidDataset, getThing, getStringWithLocale, getThingAll } from '@digita-ai/nde-erfgoed-client';
import { CollectionObject, CollectionObjectStore, Collection  } from '@digita-ai/nde-erfgoed-core';

export class CollectionObjectSolidStore implements CollectionObjectStore {

  /**
   * Retrieves all objects for a specific collection.
   *
   * @param collection The collection for which to retrieve objects.
   */
  async getObjectsForCollection(collection: Collection): Promise<CollectionObject[]> {

    try {

      const dataset = await getSolidDataset(collection.objectsUri);

      const objectThings = getThingAll(dataset); // a list of CollectionObject Things

      const objects = objectThings.map((thing) => ({
        uri: collection.objectsUri,
        collection: collection.uri,
        name: getStringWithLocale(thing, 'http://schema.org/name', 'nl'),
        description: getStringWithLocale(thing, 'http://schema.org/description', 'nl'),
        type: undefined,
        subject: undefined,
        image: undefined,
        updated: undefined,
      }));

      return objects.filter((object) => object.collection === collection.uri);

    } catch (e) {

      return [];

    }

  }

  /**
   * Retrieves a single Collection
   *
   * @param uri The URI of the Collection
   */
  async getObject(uri: string): Promise<CollectionObject> {

    const dataset = await getSolidDataset(uri);

    const collectionThing = getThing(dataset, uri);

    return {
      uri,
      collection: 'http://localhost:3000/leapeeters/heritage-collections/catalog#collection-1',
      name: getStringWithLocale(collectionThing, 'http://schema.org/name', 'nl'),
      description: getStringWithLocale(collectionThing, 'http://schema.org/description', 'nl'),
      type: undefined,
      subject: undefined,
      image: undefined,
      updated: undefined,
    };

  }

  /**
   * Retrieves a list of collections for a given WebID
   *
   * @param webId The WebID to retreive Collections from
   */
  async all(): Promise<CollectionObject[]> {

    return [ await this.getObject('http://localhost:3000/leapeeters/heritage-objects/data-1#object-1') ];

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
