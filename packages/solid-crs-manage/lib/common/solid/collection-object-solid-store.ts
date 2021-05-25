import { getUrl, getSolidDataset, getThing, getStringWithLocale, getThingAll, asUrl, ThingPersisted, fetch, createThing, addStringNoLocale, addUrl, addStringWithLocale, getStringNoLocale } from '@netwerk-digitaal-erfgoed/solid-crs-client';
import { CollectionObject, CollectionObjectStore, Collection, ArgumentError, fulltextMatch } from '@netwerk-digitaal-erfgoed/solid-crs-core';

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
  async get(uri: string): Promise<CollectionObject> {

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
   * @param object The collection to convert
   * @returns a Thing
   */
  static toThing(object: CollectionObject): ThingPersisted {

    if (!object) {

      throw new ArgumentError('Argument object should be set', object);

    }

    let result = createThing({ url: object.uri });

    // identification
    result = addStringNoLocale(result, 'http://schema.org/dateModified', object.updated);
    result = addUrl(result, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', object.type);
    result = addUrl(result, 'http://schema.org/additionalType', object.additionalType);
    result = addStringNoLocale(result, 'http://schema.org/identifier', object.identifier);
    result = addStringWithLocale(result, 'http://schema.org/name', 'nl', object.name);
    result = addStringWithLocale(result, 'http://schema.org/description', 'nl', object.description);
    result = addUrl(result, 'http://schema.org/isPartOf', object.collection);
    result = addUrl(result, 'http://schema.org/maintainer', object.maintainer);

    // creation
    result = addUrl(result, 'http://schema.org/creator', object.creator);
    result = addUrl(result, 'http://schema.org/locationCreated', object.locationCreated);
    result = addUrl(result, 'http://schema.org/material', object.material);
    result = addStringNoLocale(result, 'http://schema.org/dateCreated', object.dateCreated);

    // representation
    // dimensions
    // => todo figure out blank nodes

    // other
    result = addUrl(result, 'http://schema.org/image', object.image);
    result = addUrl(result, 'http://schema.org/mainEntityOfPage', object.mainEntityOfPage);

    return result;

  }

  /**
   * Creates a Collection from a ThingPersisted
   *
   * @param object The collection to convert
   * @returns a Collection
   */
  static fromThing(object: ThingPersisted): CollectionObject {

    if (!object) {

      throw new ArgumentError('Argument object should be set', object);

    }

    return {
      // identification
      uri: asUrl(object),
      updated: getStringNoLocale(object, 'http://schema.org/dateModified'),
      type: getUrl(object, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
      additionalType: getUrl(object, 'http://schema.org/additionalType'),
      identifier: getStringNoLocale(object, 'http://schema.org/identifier'),
      name: getStringWithLocale(object, 'http://schema.org/name', 'nl'),
      description: getStringWithLocale(object, 'http://schema.org/description', 'nl'),
      collection: getUrl(object, 'http://schema.org/isPartOf'),
      maintainer: getUrl(object, 'http://schema.org/maintainer'),

      // creation
      creator: getUrl(object, 'http://schema.org/creator'),
      locationCreated: getUrl(object, 'http://schema.org/locationCreated'),
      material: getUrl(object, 'http://schema.org/material'),
      dateCreated: getStringNoLocale(object, 'http://schema.org/dateCreated'),

      // representation
      // dimensions
      // => todo figure out blank nodes

      // other
      image: getUrl(object, 'http://schema.org/image'),
      mainEntityOfPage: getUrl(object, 'http://schema.org/mainEntityOfPage'),
      subject: undefined,
    } as CollectionObject;

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
