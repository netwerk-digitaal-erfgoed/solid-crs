import { getUrl, getSolidDataset, getThing, getStringWithLocale, getThingAll, asUrl, ThingPersisted, fetch, createThing, addStringNoLocale, addUrl, addStringWithLocale, getStringNoLocale, saveSolidDatasetAt, setThing, removeThing, getInteger, addInteger, Thing } from '@netwerk-digitaal-erfgoed/solid-crs-client';
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

    const objectThings = getThingAll(dataset).filter((thing: Thing) =>
      getUrl(thing, 'http://schema.org/isPartOf') === collection.uri); // a list of CollectionObject Things

    if (!objectThings || objectThings.length === 0) {

      return [];

    }

    return objectThings.map((objectThing: ThingPersisted) =>
      CollectionObjectSolidStore.fromThing(
        objectThing,
        getThing(dataset, getUrl(objectThing, 'http://schema.org/mainEntityOfPage'))
      ));

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

    const objectThing = getThing(dataset, uri);
    const digitalObjectUri = getUrl(objectThing, 'http://schema.org/mainEntityOfPage');
    const digitalObjectThing = getThing(dataset, digitalObjectUri);

    return CollectionObjectSolidStore.fromThing(objectThing, digitalObjectThing);

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
  async delete(object: CollectionObject): Promise<CollectionObject> {

    if (!object) {

      throw new ArgumentError('Argument object should be set', object);

    }

    // retrieve the objects dataset
    const objectDataset = await getSolidDataset(object.uri, { fetch });
    // remove things from objects dataset
    let updatedDataset = removeThing(objectDataset, object.uri);
    updatedDataset = removeThing(updatedDataset, `${object.uri}-digital`);
    // save the dataset
    await saveSolidDatasetAt(object.uri, updatedDataset, { fetch });

    return object;

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
    let objectUri: string;

    // check if the collection changed (aka contentUrl changed)
    if (!object.uri || object.uri.includes(contentUrl)) {

      // the collection's contentUrl matches the object's URI, or is not set (new object)
      objectUri = object.uri || new URL(`#object-${v4()}`, contentUrl).toString();

    } else {

      // the collection's contentUrl changed
      // -> move the object to that contentUrl
      objectUri = new URL(`#object-${v4()}`, contentUrl).toString();

      // -> delete object from old contentUrl
      const oldDataset = await getSolidDataset(object.uri, { fetch });
      const oldObjectThing = getThing(oldDataset, object.uri);
      const oldDigitalObjectThing = getThing(oldDataset, CollectionObjectSolidStore.getDigitalObjectUri(object));
      let updatedOldObjectsDataset = removeThing(oldDataset, oldObjectThing);
      updatedOldObjectsDataset = removeThing(updatedOldObjectsDataset, oldDigitalObjectThing);
      await saveSolidDatasetAt(object.uri, updatedOldObjectsDataset, { fetch });

    }

    // transform and save the object to the dataset of objects
    const objectsDataset = await getSolidDataset(objectUri, { fetch });

    const { object: objectThing, digitalObject: digitalObjectThing }
      = CollectionObjectSolidStore.toThing({ ...object, uri: objectUri });

    let updatedObjectsDataset = setThing(objectsDataset, objectThing);
    updatedObjectsDataset = setThing(updatedObjectsDataset, digitalObjectThing);
    await saveSolidDatasetAt(objectUri, updatedObjectsDataset, { fetch });

    return { ...object, uri: objectUri };

  }

  /**
   * Converts a CollectionObject to Things
   *
   * @param object The CollectionObject to convert
   * @returns The main object and digital object as Things
   */
  static toThing(object: CollectionObject): { object: ThingPersisted; digitalObject: ThingPersisted } {

    if (!object) {

      throw new ArgumentError('Argument object should be set', object);

    }

    let objectThing = createThing({ url: object.uri });
    const digitalObjectUri = CollectionObjectSolidStore.getDigitalObjectUri(object);

    // identification
    objectThing = object.updated ? addStringNoLocale(objectThing, 'http://schema.org/dateModified', object.updated) : objectThing;
    objectThing = object.type ? addUrl(objectThing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', object.type) : objectThing;
    objectThing = object.additionalType ? addUrl(objectThing, 'http://schema.org/additionalType', object.additionalType) : objectThing;
    objectThing = object.identifier ? addStringNoLocale(objectThing, 'http://schema.org/identifier', object.identifier) : objectThing;
    objectThing = object.name ? addStringWithLocale(objectThing, 'http://schema.org/name', object.name, 'nl') : objectThing;
    objectThing = object.description ? addStringWithLocale(objectThing, 'http://schema.org/description', object.description, 'nl') : objectThing;
    objectThing = object.collection ? addUrl(objectThing, 'http://schema.org/isPartOf', object.collection) : objectThing;
    objectThing = object.maintainer ? addUrl(objectThing, 'http://schema.org/maintainer', object.maintainer) : objectThing;

    // creation
    objectThing = object.creator ? addStringNoLocale(objectThing, 'http://schema.org/creator', object.creator) : objectThing;
    objectThing = object.locationCreated ? addStringNoLocale(objectThing, 'http://schema.org/locationCreated', object.locationCreated) : objectThing;
    objectThing = object.material ? addStringNoLocale(objectThing, 'http://schema.org/material', object.material) : objectThing;
    objectThing = object.dateCreated ? addStringNoLocale(objectThing, 'http://schema.org/dateCreated', object.dateCreated) : objectThing;

    // representation
    objectThing = object.subject ? addStringNoLocale(objectThing, 'http://schema.org/DefinedTerm', object.subject) : objectThing;
    objectThing = object.location ? addStringNoLocale(objectThing, 'http://schema.org/Place', object.location) : objectThing;
    objectThing = object.person ? addStringNoLocale(objectThing, 'http://schema.org/Person', object.person) : objectThing;
    objectThing = object.organization ? addStringNoLocale(objectThing, 'http://schema.org/Organization', object.organization) : objectThing;
    objectThing = object.event ? addStringNoLocale(objectThing, 'http://schema.org/Event', object.event) : objectThing;

    // dimensions
    objectThing = object.height ? addInteger(objectThing, 'http://schema.org/height', object.height) : objectThing;
    objectThing = object.width ? addInteger(objectThing, 'http://schema.org/width', object.width) : objectThing;
    objectThing = object.depth ? addInteger(objectThing, 'http://schema.org/depth', object.depth) : objectThing;
    objectThing = object.weight ? addInteger(objectThing, 'http://schema.org/weight', object.weight) : objectThing;

    // other
    objectThing =  addUrl(objectThing, 'http://schema.org/mainEntityOfPage', digitalObjectUri);

    // digital object
    let digitalObjectThing = createThing({ url: digitalObjectUri });

    digitalObjectThing = addUrl(digitalObjectThing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/ImageObject');
    digitalObjectThing = object.image ? addUrl(digitalObjectThing, 'http://schema.org/contentUrl', object.image) : digitalObjectThing;
    digitalObjectThing = object.license ? addUrl(digitalObjectThing, 'http://schema.org/license', object.license) : digitalObjectThing;
    digitalObjectThing = addUrl(digitalObjectThing, 'http://schema.org/mainEntity', object.uri);

    return { object: objectThing, digitalObject: digitalObjectThing };

  }

  /**
   * Creates a CollectionObject from a ThingPersisted
   *
   * @param object The ThingPersisted to convert
   * @returns a CollectionObject
   */
  static fromThing(object: ThingPersisted, digitalObject: ThingPersisted): CollectionObject {

    if (!object) {

      throw new ArgumentError('Argument object should be set', object);

    }

    if (!digitalObject) {

      throw new ArgumentError('Argument digitalObject should be set', digitalObject);

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
      creator: getStringNoLocale(object, 'http://schema.org/creator') || undefined,
      locationCreated: getStringNoLocale(object, 'http://schema.org/locationCreated') || undefined,
      material: getStringNoLocale(object, 'http://schema.org/material') || undefined,
      dateCreated: getStringNoLocale(object, 'http://schema.org/dateCreated') || undefined,

      // representation
      subject: getStringNoLocale(object, 'http://schema.org/DefinedTerm') || undefined,
      location: getStringNoLocale(object, 'http://schema.org/Place') || undefined,
      person: getStringNoLocale(object, 'http://schema.org/Person') || undefined,
      organization: getStringNoLocale(object, 'http://schema.org/Organization') || undefined,
      event: getStringNoLocale(object, 'http://schema.org/Event') || undefined,

      // dimensions
      height: getInteger(object, 'http://schema.org/height') || undefined,
      width: getInteger(object, 'http://schema.org/width') || undefined,
      depth: getInteger(object, 'http://schema.org/depth') || undefined,
      weight: getInteger(object, 'http://schema.org/weight') || undefined,

      // other
      mainEntityOfPage: asUrl(digitalObject) || undefined,

      // digital object
      image: getUrl(digitalObject, 'http://schema.org/contentUrl') || undefined,
      license: getUrl(digitalObject, 'http://schema.org/license') || undefined,

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

  /**
   * Retrieves the URI of the digital object for a given CollectionObject
   */
  static getDigitalObjectUri(object: CollectionObject): string {

    if (!object) {

      throw new ArgumentError('Argument object should be set.', object);

    }

    if (!object.uri) {

      throw new ArgumentError('Argument object uri should be set.', object);

    }

    return `${object.uri}-digital`;

  }

}
