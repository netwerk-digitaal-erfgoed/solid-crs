import { getUrl, getSolidDataset, getThing, getStringWithLocale, getThingAll, asUrl, ThingPersisted, fetch, Thing, getStringNoLocale, getDatetime, getUrlAll } from '@digita-ai/nde-erfgoed-client';
import { CollectionObject, CollectionObjectStore, Collection, ArgumentError } from '@digita-ai/nde-erfgoed-core';

export class CollectionObjectSolidStore implements CollectionObjectStore {

  /**
   * Retrieves all objects for a specific collection.
   *
   * @param collection The collection for which to retrieve objects.
   */
  async getObjectsForCollection(collection: Collection): Promise<CollectionObject[]> {

    if (!collection) {

      throw new ArgumentError('Argument collection should be set', collection);

    }

    const dataset = await getSolidDataset(collection.objectsUri, { fetch });

    if (!dataset) {

      return [];

    }

    const objectThings = getThingAll(dataset).filter((thing) =>
      getUrl(thing, 'http://schema.org/isPartOf') === collection.uri); // a list of CollectionObject Things

    if (!objectThings) {

      return [];

    }

    return objectThings.map((objectThing: ThingPersisted) =>
      CollectionObjectSolidStore.fromThing(objectThing));

  }

  /**
   * Retrieves a single Collection
   *
   * @param uri The URI of the Collection
   */
  async getObject(uri: string): Promise<CollectionObject> {

    if (!uri) {

      throw new ArgumentError('Argument uri should be set', uri);

    }

    const dataset = await getSolidDataset(uri, { fetch });

    const collectionThing = getThing(dataset, uri);

    return {
      uri,
      collection: getUrl(collectionThing, 'http://schema.org/isPartOf'),
      name: getStringWithLocale(collectionThing, 'http://schema.org/name', 'nl'),
      description: getStringWithLocale(collectionThing, 'http://schema.org/description', 'nl'),
      type: undefined,
      subject: undefined,
      image: undefined,
      updated: undefined,
    } as CollectionObject;

  }

  /**
   * Retrieves a list of collections for the current WebID
   *
   */
  async all(): Promise<CollectionObject[]> {

    throw new Error('Method not implemented.');

  }

  /**
   * Deletes a single Collection from a pod
   *
   * @param resource The Collection to delete
   */
  async delete(resource: CollectionObject): Promise<CollectionObject> {

    throw new Error('Method not implemented.');

  }

  /**
   * Stores a single Collection to a pod
   *
   * @param resource The Collection to save
   */
  async save(resource: CollectionObject): Promise<CollectionObject> {

    throw new Error('Method not implemented.');

  }

  /**
   * Converts a Collection to a Thing
   *
   * @param collection The collection to convert
   * @returns a Thing
   */
  static toThing(collection: CollectionObject): Thing {

    return null;

  }

  /**
   * Creates a Collection from a ThingPersisted
   *
   * @param collection The collection to convert
   * @returns a Collection
   */
  static fromThing(collection: ThingPersisted): CollectionObject {

    return {
      uri: asUrl(collection),
      updated: getStringNoLocale(collection, 'http://schema.org/dateModified'),
      type: getUrl(collection, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
      additionalType: getUrl(collection, 'http://schema.org/additionalType'),
      identifier: getStringNoLocale(collection, 'http://schema.org/identifier'),
      name: getStringWithLocale(collection, 'http://schema.org/name', 'nl'),
      description: getStringWithLocale(collection, 'http://schema.org/description', 'nl'),
      collection: getUrl(collection, 'http://schema.org/isPartOf'),
      maintainer: getUrl(collection, 'http://schema.org/maintainer'),

      creator: getUrl(collection, 'http://schema.org/creator'),
      locationCreated: getUrl(collection, 'http://schema.org/locationCreated'),
      material: getUrl(collection, 'http://schema.org/material'),
      dateCreated: getStringNoLocale(collection, 'http://schema.org/dateCreated'),

      // todo figure out blank nodes

      image: getUrl(collection, 'http://schema.org/image'),
      mainEntityOfPage: getUrl(collection, 'http://schema.org/mainEntityOfPage'),
    } as CollectionObject;

  }

}
