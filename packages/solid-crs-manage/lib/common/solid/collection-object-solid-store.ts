import { getUrl, getSolidDataset, getThing, getStringWithLocale, getThingAll, asUrl, ThingPersisted, fetch, createThing, addStringNoLocale, addUrl, addStringWithLocale, getStringNoLocale, saveSolidDatasetAt, setThing, removeThing, getDecimal, addDecimal, Thing } from '@netwerk-digitaal-erfgoed/solid-crs-client';
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
        getThing(dataset, getUrl(objectThing, 'http://schema.org/mainEntityOfPage')),
        getThing(dataset, getUrl(objectThing, 'http://schema.org/height')),
        getThing(dataset, getUrl(objectThing, 'http://schema.org/width')),
        getThing(dataset, getUrl(objectThing, 'http://schema.org/depth')),
        getThing(dataset, getUrl(objectThing, 'http://schema.org/weight')),
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

    return CollectionObjectSolidStore.fromThing(
      objectThing,
      getThing(dataset, getUrl(objectThing, 'http://schema.org/mainEntityOfPage')),
      getThing(dataset, getUrl(objectThing, 'http://schema.org/height')),
      getThing(dataset, getUrl(objectThing, 'http://schema.org/width')),
      getThing(dataset, getUrl(objectThing, 'http://schema.org/depth')),
      getThing(dataset, getUrl(objectThing, 'http://schema.org/weight')),
    );

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
    updatedDataset = removeThing(updatedDataset, CollectionObjectSolidStore.getDigitalObjectUri(object));
    updatedDataset = removeThing(updatedDataset, `${object.uri}-height`);
    updatedDataset = removeThing(updatedDataset, `${object.uri}-width`);
    updatedDataset = removeThing(updatedDataset, `${object.uri}-depth`);
    updatedDataset = removeThing(updatedDataset, `${object.uri}-weight`);
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
      const oldHeightThing = getThing(oldDataset, `${object.uri}-height`);
      const oldWidthThing = getThing(oldDataset, `${object.uri}-width`);
      const oldDepthThing = getThing(oldDataset, `${object.uri}-depth`);
      const oldWeightThing = getThing(oldDataset, `${object.uri}-weight`);
      let updatedOldObjectsDataset = removeThing(oldDataset, oldObjectThing);
      updatedOldObjectsDataset = removeThing(updatedOldObjectsDataset, oldDigitalObjectThing);
      updatedOldObjectsDataset = removeThing(updatedOldObjectsDataset, oldHeightThing);
      updatedOldObjectsDataset = removeThing(updatedOldObjectsDataset, oldWidthThing);
      updatedOldObjectsDataset = removeThing(updatedOldObjectsDataset, oldDepthThing);
      updatedOldObjectsDataset = removeThing(updatedOldObjectsDataset, oldWeightThing);
      await saveSolidDatasetAt(object.uri, updatedOldObjectsDataset, { fetch });

    }

    // transform and save the object to the dataset of objects
    const objectsDataset = await getSolidDataset(objectUri, { fetch });

    const {
      object: objectThing,
      digitalObject: digitalObjectThing,
      height: heightThing,
      width: widthThing,
      depth: depthThing,
      weight: weightThing,
    }
      = CollectionObjectSolidStore.toThing({ ...object, uri: objectUri });

    let updatedObjectsDataset = setThing(objectsDataset, objectThing);
    updatedObjectsDataset = setThing(updatedObjectsDataset, digitalObjectThing);
    updatedObjectsDataset = setThing(updatedObjectsDataset, heightThing);
    updatedObjectsDataset = setThing(updatedObjectsDataset, widthThing);
    updatedObjectsDataset = setThing(updatedObjectsDataset, depthThing);
    updatedObjectsDataset = setThing(updatedObjectsDataset, weightThing);
    await saveSolidDatasetAt(objectUri, updatedObjectsDataset, { fetch });

    return { ...object, uri: objectUri };

  }

  /**
   * Converts a CollectionObject to Things
   *
   * @param object The CollectionObject to convert
   * @returns The main object, the digital object and dimensions as Things
   */
  static toThing(object: CollectionObject): {
    object: ThingPersisted;
    digitalObject: ThingPersisted;
    height: ThingPersisted;
    width: ThingPersisted;
    depth: ThingPersisted;
    weight: ThingPersisted;
  } {

    if (!object) {

      throw new ArgumentError('Argument object should be set', object);

    }

    let objectThing = createThing({ url: object.uri });
    const digitalObjectUri = CollectionObjectSolidStore.getDigitalObjectUri(object);

    // identification
    objectThing = object.updated ? addStringNoLocale(objectThing, 'http://schema.org/dateModified', object.updated) : objectThing;
    objectThing = object.type ? addUrl(objectThing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', object.type) : objectThing;
    objectThing = object.additionalType ? addStringWithLocale(objectThing, 'http://schema.org/additionalType', object.additionalType, 'nl') : objectThing;
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
    let heightThing = createThing({ url: `${object.uri}-height` });
    heightThing = addUrl(heightThing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/QuantitativeValue');
    heightThing = object.height !== undefined && object.height !== null ? addDecimal(heightThing, 'http://schema.org/value', object.height) : heightThing;
    heightThing = object.heightUnit !== undefined && object.heightUnit !== null ? addStringNoLocale(heightThing, 'http://schema.org/unitCode', object.heightUnit) : heightThing;

    let widthThing = createThing({ url: `${object.uri}-width` });
    widthThing = addUrl(widthThing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/QuantitativeValue');
    widthThing = object.width !== undefined && object.width !== null ? addDecimal(widthThing, 'http://schema.org/value', object.width) : widthThing;
    widthThing = object.widthUnit !== undefined && object.widthUnit !== null ? addStringNoLocale(widthThing, 'http://schema.org/unitCode', object.widthUnit) : widthThing;

    let depthThing = createThing({ url: `${object.uri}-depth` });
    depthThing = addUrl(depthThing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/QuantitativeValue');
    depthThing = object.depth !== undefined && object.depth !== null ? addDecimal(depthThing, 'http://schema.org/value', object.depth) : depthThing;
    depthThing = object.depthUnit !== undefined && object.depthUnit !== null ? addStringNoLocale(depthThing, 'http://schema.org/unitCode', object.depthUnit) : depthThing;

    let weightThing = createThing({ url: `${object.uri}-weight` });
    weightThing = addUrl(weightThing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/QuantitativeValue');
    weightThing = object.weight !== undefined && object.weight !== null ? addDecimal(weightThing, 'http://schema.org/value', object.weight) : weightThing;
    weightThing = object.weightUnit !== undefined && object.weightUnit !== null ? addStringNoLocale(weightThing, 'http://schema.org/unitCode', object.weightUnit) : weightThing;

    objectThing = addUrl(objectThing, 'http://schema.org/height', asUrl(heightThing));
    objectThing = addUrl(objectThing, 'http://schema.org/width', asUrl(widthThing));
    objectThing = addUrl(objectThing, 'http://schema.org/depth', asUrl(depthThing));
    objectThing = addUrl(objectThing, 'http://schema.org/weight', asUrl(weightThing));

    // other
    objectThing =  addUrl(objectThing, 'http://schema.org/mainEntityOfPage', digitalObjectUri);

    // digital object
    let digitalObjectThing = createThing({ url: digitalObjectUri });

    digitalObjectThing = addUrl(digitalObjectThing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/ImageObject');
    digitalObjectThing = object.image ? addUrl(digitalObjectThing, 'http://schema.org/contentUrl', object.image) : digitalObjectThing;
    digitalObjectThing = object.license ? addUrl(digitalObjectThing, 'http://schema.org/license', object.license) : digitalObjectThing;
    digitalObjectThing = addUrl(digitalObjectThing, 'http://schema.org/mainEntity', object.uri);

    return {
      object: objectThing,
      digitalObject: digitalObjectThing,
      height: heightThing,
      width: widthThing,
      depth: depthThing,
      weight: weightThing,
    };

  }

  /**
   * Creates a CollectionObject from a ThingPersisted
   *
   * @param object The ThingPersisted to convert
   * @returns a CollectionObject
   */
  static fromThing(
    object: ThingPersisted,
    digitalObject: ThingPersisted,
    height: ThingPersisted,
    width: ThingPersisted,
    depth: ThingPersisted,
    weight: ThingPersisted,
  ): CollectionObject {

    if (!object) {

      throw new ArgumentError('Argument object should be set', object);

    }

    if (!digitalObject) {

      throw new ArgumentError('Argument digitalObject should be set', digitalObject);

    }

    if (!height) {

      throw new ArgumentError('Argument height should be set', height);

    }

    if (!width) {

      throw new ArgumentError('Argument width should be set', width);

    }

    if (!depth) {

      throw new ArgumentError('Argument depth should be set', depth);

    }

    if (!weight) {

      throw new ArgumentError('Argument weight should be set', weight);

    }

    return {
      // identification
      uri: asUrl(object),
      updated: getStringNoLocale(object, 'http://schema.org/dateModified') || undefined,
      type: getUrl(object, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') || undefined,
      additionalType: getStringWithLocale(object, 'http://schema.org/additionalType', 'nl') || undefined,
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
      height: getDecimal(height, 'http://schema.org/value') !== null ? getDecimal(height, 'http://schema.org/value') : undefined,
      width: getDecimal(width, 'http://schema.org/value') !== null ? getDecimal(width, 'http://schema.org/value') : undefined,
      depth: getDecimal(depth, 'http://schema.org/value') !== null ? getDecimal(depth, 'http://schema.org/value') : undefined,
      weight: getDecimal(weight, 'http://schema.org/value') !== null ? getDecimal(weight, 'http://schema.org/value') : undefined,
      heightUnit: getStringNoLocale(height, 'http://schema.org/unitCode') !== null ? getStringNoLocale(height, 'http://schema.org/unitCode') : undefined,
      widthUnit: getStringNoLocale(width, 'http://schema.org/unitCode') !== null ? getStringNoLocale(width, 'http://schema.org/unitCode') : undefined,
      depthUnit: getStringNoLocale(depth, 'http://schema.org/unitCode') !== null ? getStringNoLocale(depth, 'http://schema.org/unitCode') : undefined,
      weightUnit: getStringNoLocale(weight, 'http://schema.org/unitCode') !== null ? getStringNoLocale(weight, 'http://schema.org/unitCode') : undefined,

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
