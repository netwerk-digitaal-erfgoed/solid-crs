import { getUrl, getSolidDataset, getThing, getStringWithLocale, getThingAll, asUrl, ThingPersisted, fetch, createThing, addStringNoLocale, addUrl, addStringWithLocale, getStringNoLocale, saveSolidDatasetAt, setThing } from '@netwerk-digitaal-erfgoed/solid-crs-client';
import { CollectionObject, CollectionObjectStore, Collection, ArgumentError, fulltextMatch } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { v4 } from 'uuid';

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

    if (!objectThings || objectThings.length === 0) {

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
   * Deletes a single Collection from a pod\
   *
   * @param resource The Collection to delete
   */
  async delete(resource: CollectionObject): Promise<CollectionObject> {

    // remove thing from objects file

    // remove reference from collection's distribution

    throw new Error('Method not implemented.');

  }

  /**
   * Stores a single Collection to a pod
   *
   * @param resource The Collection to save
   */
  async save(object: CollectionObject): Promise<CollectionObject> {

    if (!object) {

      throw new ArgumentError('Argument object should be set', object);

    }

    if (!object.collection) {

      throw new ArgumentError('The object must be linked to a collection', object);

    }

    // retrieve the catalog
    const catalogDataset = await getSolidDataset(object.collection, { fetch });

    // find out where to save this object based on its collection
    const collectionThing = getThing(catalogDataset, object.collection);
    const distributionUri = getUrl(collectionThing, 'http://schema.org/distribution');
    const distributionThing = getThing(catalogDataset, distributionUri);
    const contentUrl = getUrl(distributionThing, 'http://schema.org/contentUrl');
    const objectUri = object.uri || new URL(`#object-${v4()}`, contentUrl).toString();

    // transform and save the object to the dataset of objects
    const objectsDataset = await getSolidDataset(objectUri, { fetch });
    const updatedObjectsDataset = setThing(objectsDataset, CollectionObjectSolidStore.toThing(object));
    await saveSolidDatasetAt(objectUri, updatedObjectsDataset, { fetch });

    return { ...object, uri: objectUri };

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
    result = object.updated ? addStringNoLocale(result, 'http://schema.org/dateModified', object.updated) : result;
    result = object.type ? addUrl(result, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', object.type) : result;
    result = object.additionalType ? addUrl(result, 'http://schema.org/additionalType', object.additionalType) : result;
    result = object.identifier ? addStringNoLocale(result, 'http://schema.org/identifier', object.identifier) : result;
    result = object.name ? addStringWithLocale(result, 'http://schema.org/name', object.name, 'nl') : result;
    result = object.description ? addStringWithLocale(result, 'http://schema.org/description', object.description, 'nl') : result;
    result = object.collection ? addUrl(result, 'http://schema.org/isPartOf', object.collection) : result;
    result = object.maintainer ? addUrl(result, 'http://schema.org/maintainer', object.maintainer) : result;

    // creation
    result = object.creator ? addUrl(result, 'http://schema.org/creator', object.creator) : result;
    result = object.locationCreated ? addUrl(result, 'http://schema.org/locationCreated', object.locationCreated) : result;
    result = object.material ? addUrl(result, 'http://schema.org/material', object.material) : result;
    result = object.dateCreated ? addStringNoLocale(result, 'http://schema.org/dateCreated', object.dateCreated) : result;

    // representation
    // dimensions
    // => todo figure out blank nodes

    // other
    result =  object.image ? addUrl(result, 'http://schema.org/image', object.image) : result;
    result =  object.mainEntityOfPage ? addUrl(result, 'http://schema.org/mainEntityOfPage', object.mainEntityOfPage) : result;

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
      updated: getStringNoLocale(object, 'http://schema.org/dateModified') || undefined,
      type: getUrl(object, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') || undefined,
      additionalType: getUrl(object, 'http://schema.org/additionalType') || undefined,
      identifier: getStringNoLocale(object, 'http://schema.org/identifier') || undefined,
      name: getStringWithLocale(object, 'http://schema.org/name', 'nl') || undefined,
      description: getStringWithLocale(object, 'http://schema.org/description', 'nl') || undefined,
      collection: getUrl(object, 'http://schema.org/isPartOf') || undefined,
      maintainer: getUrl(object, 'http://schema.org/maintainer') || undefined,

      // creation
      creator: getUrl(object, 'http://schema.org/creator') || undefined,
      locationCreated: getUrl(object, 'http://schema.org/locationCreated') || undefined,
      material: getUrl(object, 'http://schema.org/material') || undefined,
      dateCreated: getStringNoLocale(object, 'http://schema.org/dateCreated') || undefined,

      // representation
      // dimensions
      // => todo figure out blank nodes

      // other
      image: getUrl(object, 'http://schema.org/image') || undefined,
      mainEntityOfPage: getUrl(object, 'http://schema.org/mainEntityOfPage') || undefined,
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
