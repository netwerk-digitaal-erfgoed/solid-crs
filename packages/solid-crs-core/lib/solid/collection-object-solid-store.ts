import { SolidSDKService } from '@digita-ai/inrupt-solid-service';
import { getUrl, getSolidDataset, getThing, getStringWithLocale, getThingAll, asUrl, ThingPersisted, createThing, addStringNoLocale, addUrl, addStringWithLocale, getStringNoLocale, saveSolidDatasetAt, setThing, removeThing, getDecimal, addDecimal, SolidDataset, getUrlAll, saveFileInContainer } from '@netwerk-digitaal-erfgoed/solid-crs-client';
import { v4, v5 } from 'uuid';
import { Collection } from '../collections/collection';
import { CollectionObject } from '../collections/collection-object';
import { CollectionObjectStore } from '../collections/collection-object-store';
import { ArgumentError } from '../errors/argument-error';
import { Term } from '../terms/term';
import { fulltextMatch } from '../utils/fulltext-match';
import { SolidStore } from './solid-store';

export class CollectionObjectSolidStore extends SolidStore<CollectionObject> implements CollectionObjectStore {

  constructor(protected solidService: SolidSDKService) {

    super(solidService);

  }

  /**
   * Retrieves all objects for a specific collection.
   *
   * @param collection The collection for which to retrieve objects.
   */
  async getObjectsForCollection(collection: Collection): Promise<CollectionObject[]> {

    if (!collection) {

      throw new ArgumentError('Argument collection should be set', collection);

    }

    const dataset = await getSolidDataset(collection.objectsUri, { fetch: this.getSession().fetch });

    if (!dataset) {

      return [];

    }

    const objectThings = getThingAll(dataset).filter((thing) =>
      getUrl(thing, 'http://schema.org/isPartOf') === collection.uri) as ThingPersisted[]; // a list of CollectionObject Things

    if (!objectThings || objectThings.length === 0) {

      return [];

    }

    return objectThings.map((objectThing) => {

      const digitalObject = getThing(dataset, getUrl(objectThing, 'http://schema.org/mainEntityOfPage') || CollectionObjectSolidStore.getDigitalObjectUri(asUrl(objectThing)));

      if (!digitalObject) {

        throw new ArgumentError('Could not find digitalObject in dataset', digitalObject);

      }

      return CollectionObjectSolidStore.fromThing(
        objectThing,
        digitalObject,
        getThing(dataset, getUrl(objectThing, 'http://schema.org/height') || `${asUrl(objectThing)}-height`) ?? undefined,
        getThing(dataset, getUrl(objectThing, 'http://schema.org/width') || `${asUrl(objectThing)}-width`) ?? undefined,
        getThing(dataset, getUrl(objectThing, 'http://schema.org/depth') || `${asUrl(objectThing)}-depth`) ?? undefined,
        getThing(dataset, getUrl(objectThing, 'http://schema.org/weight') || `${asUrl(objectThing)}-weight`) ?? undefined,
        getUrlAll(objectThing, 'http://schema.org/about').map((thingUri) => getThing(dataset, thingUri)).filter((thing) => thing !== null) as ThingPersisted[],
        dataset
      );

    });

  }

  /**
   * Retrieves a single Object
   *
   * @param uri The URI of the Object
   */
  async get(uri: string): Promise<CollectionObject> {

    if (!uri) {

      throw new ArgumentError('Argument uri should be set', uri);

    }

    const dataset = await getSolidDataset(uri, { fetch: this.getSession().fetch });

    const objectThing = getThing(dataset, uri);

    if (!objectThing) {

      throw new ArgumentError('Could not find objectThing in dataset', objectThing);

    }

    const digitalObject = getThing(dataset, getUrl(objectThing, 'http://schema.org/mainEntityOfPage') || CollectionObjectSolidStore.getDigitalObjectUri(asUrl(objectThing)));

    if (!digitalObject) {

      throw new ArgumentError('Could not find digitalObject in dataset', digitalObject);

    }

    return CollectionObjectSolidStore.fromThing(
      objectThing,
      digitalObject,
      getThing(dataset, getUrl(objectThing, 'http://schema.org/height') || `${asUrl(objectThing)}-height`) ?? undefined,
      getThing(dataset, getUrl(objectThing, 'http://schema.org/width') || `${asUrl(objectThing)}-width`) ?? undefined,
      getThing(dataset, getUrl(objectThing, 'http://schema.org/depth') || `${asUrl(objectThing)}-depth`) ?? undefined,
      getThing(dataset, getUrl(objectThing, 'http://schema.org/weight') || `${asUrl(objectThing)}-weight`) ?? undefined,
      getUrlAll(objectThing, 'http://schema.org/about').map((thingUri) => getThing(dataset, thingUri)).filter((thing) => thing !== null) as ThingPersisted[],
      dataset
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
    const objectDataset = await getSolidDataset(object.uri, { fetch: this.getSession().fetch });
    // remove things from objects dataset
    let updatedDataset = removeThing(objectDataset, object.uri);
    updatedDataset = removeThing(updatedDataset, CollectionObjectSolidStore.getDigitalObjectUri(object.uri));
    updatedDataset = removeThing(updatedDataset, `${object.uri}-height`);
    updatedDataset = removeThing(updatedDataset, `${object.uri}-width`);
    updatedDataset = removeThing(updatedDataset, `${object.uri}-depth`);
    updatedDataset = removeThing(updatedDataset, `${object.uri}-weight`);

    const objectThing = getThing(objectDataset, object.uri);

    if (!objectThing) {

      throw new ArgumentError('Could not find objectThing in dataset', objectThing);

    }

    const oldRepresentationThings = getUrlAll(objectThing, 'http://schema.org/about')
      .map((thingUri) => getThing(updatedDataset, thingUri))
      .filter((thing) => !!thing);

    updatedDataset = oldRepresentationThings.reduce((dataset, thing) => {

      if (thing) return removeThing(dataset, thing);

      return dataset;

    }, updatedDataset);

    // save the dataset
    await saveSolidDatasetAt(object.uri, updatedDataset, { fetch: this.getSession().fetch });

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
    const catalogDataset = await getSolidDataset(object.collection, { fetch: this.getSession().fetch });

    // find out where to save this object based on its collection
    const collectionThing = getThing(catalogDataset, object.collection);

    if (!collectionThing) {

      throw new ArgumentError('Could not find collectionThing in dataset', collectionThing);

    }

    const distributionUri = getUrl(collectionThing, 'http://schema.org/distribution');

    if (!distributionUri) {

      throw new ArgumentError('Could not find distributionUri in dataset', distributionUri);

    }

    const distributionThing = getThing(catalogDataset, distributionUri);

    if (!distributionThing) {

      throw new ArgumentError('Could not find distributionThing in dataset', distributionThing);

    }

    const contentUrl = getUrl(distributionThing, 'http://schema.org/contentUrl');

    if (!contentUrl) {

      throw new ArgumentError('Could not find contentUrl in dataset', contentUrl);

    }

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
      const oldDataset = await getSolidDataset(object.uri, { fetch: this.getSession().fetch });
      const oldObjectThing = getThing(oldDataset, object.uri);

      if (!oldObjectThing) {

        throw new ArgumentError('Could not find oldObjectThing in dataset', oldObjectThing);

      }

      const oldDigitalObjectThing = getThing(oldDataset, CollectionObjectSolidStore.getDigitalObjectUri(object.uri));

      if (!oldDigitalObjectThing) {

        throw new ArgumentError('Could not find oldDigitalObjectThing in dataset', oldDigitalObjectThing);

      }

      if (!object.maintainer) {

        object.maintainer = this.getSession().info.webId;

      }

      const oldHeightThing = getThing(oldDataset, `${object.uri}-height`);
      const oldWidthThing = getThing(oldDataset, `${object.uri}-width`);
      const oldDepthThing = getThing(oldDataset, `${object.uri}-depth`);
      const oldWeightThing = getThing(oldDataset, `${object.uri}-weight`);
      let updatedOldObjectsDataset = removeThing(oldDataset, oldObjectThing);
      updatedOldObjectsDataset = removeThing(updatedOldObjectsDataset, oldDigitalObjectThing);

      updatedOldObjectsDataset = oldHeightThing ?
        removeThing(updatedOldObjectsDataset, oldHeightThing) : updatedOldObjectsDataset;

      updatedOldObjectsDataset = oldWidthThing ?
        removeThing(updatedOldObjectsDataset, oldWidthThing) : updatedOldObjectsDataset;

      updatedOldObjectsDataset = oldDepthThing ?
        removeThing(updatedOldObjectsDataset, oldDepthThing) : updatedOldObjectsDataset;

      updatedOldObjectsDataset = oldWeightThing ?
        removeThing(updatedOldObjectsDataset, oldWeightThing) : updatedOldObjectsDataset;

      const oldRepresentationThings = getUrlAll(oldObjectThing, 'http://schema.org/about')
        .map((thingUri) => getThing(oldDataset, thingUri))
        .filter((thing) => !!thing);

      updatedOldObjectsDataset = oldRepresentationThings.reduce((dataset, thing) => {

        if (thing) return removeThing(dataset, thing);

        return updatedOldObjectsDataset;

      }, updatedOldObjectsDataset);

      await saveSolidDatasetAt(object.uri, updatedOldObjectsDataset, { fetch: this.getSession().fetch });

    }

    // transform and save the object to the dataset of objects
    const objectsDataset = await getSolidDataset(objectUri, { fetch: this.getSession().fetch });

    // Prepare own/local terms
    [ 'additionalType',
      'creator',
      'locationCreated',
      'material',
      'subject',
      'location',
      'person',
      'organization',
      'event' ].forEach((field: string) => {

      if ((object as any)[field]?.length > 0) {

        (object as any)[field] = (object as any)[field].map((value: Term) => ({
          name: value.name,
          uri: value.uri.startsWith('#') ? `${contentUrl}${value.uri}` : value.uri,
        }));

      }

    });

    // upload the image if a file is set and update image URI
    if (object.imageFile) {

      object.image = await this.uploadImage(object.imageFile, object.image);

    }

    // send metadata update for loaned objects when saving
    if (object.original) {

      await this.sendMetadataUpdate(object.original, object);

    }

    const {
      object: objectThing,
      digitalObject: digitalObjectThing,
      height: heightThing,
      width: widthThing,
      depth: depthThing,
      weight: weightThing,
      subjects: subjectThings,
      locations: locationThings,
      persons: personThings,
      organizations: organizationThings,
      events: eventThings,
    } = CollectionObjectSolidStore.toThing({ ...object, uri: objectUri });

    let updatedObjectsDataset = setThing(objectsDataset, objectThing);
    updatedObjectsDataset = setThing(updatedObjectsDataset, digitalObjectThing);
    updatedObjectsDataset = heightThing ? setThing(updatedObjectsDataset, heightThing) : removeThing(updatedObjectsDataset, `${objectUri}-height`);
    updatedObjectsDataset = widthThing ? setThing(updatedObjectsDataset, widthThing) : removeThing(updatedObjectsDataset, `${objectUri}-width`);
    updatedObjectsDataset = depthThing ? setThing(updatedObjectsDataset, depthThing) : removeThing(updatedObjectsDataset, `${objectUri}-depth`);
    updatedObjectsDataset = weightThing ? setThing(updatedObjectsDataset, weightThing) : removeThing(updatedObjectsDataset, `${objectUri}-weight`);

    // save representation Things seperately
    const representationThings = [
      ... subjectThings && subjectThings?.length > 0 ? subjectThings : [],
      ... locationThings && locationThings?.length > 0 ? locationThings : [],
      ... personThings && personThings?.length > 0 ? personThings : [],
      ... organizationThings && organizationThings?.length > 0 ? organizationThings : [],
      ... eventThings && eventThings?.length > 0 ? eventThings : [],
    ];

    updatedObjectsDataset = representationThings.reduce((dataset, thing) =>
      setThing(dataset, thing), updatedObjectsDataset);

    // save all other Terms seperately
    [ 'additionalType',
      'creator',
      'locationCreated',
      'material' ].forEach((termProperty) => {

      const propertyValue: Term[] = (object as any)[termProperty];

      if (propertyValue?.length > 0) {

        updatedObjectsDataset = propertyValue.reduce((dataset, value) => setThing(dataset, addStringNoLocale(createThing({ url: value.uri }), 'http://schema.org/name', value.name)), updatedObjectsDataset);

      }

    });

    await saveSolidDatasetAt(objectUri, updatedObjectsDataset, { fetch: this.getSession().fetch });

    // set public read access for object
    await this.setPublicAccess(objectUri);
    // set public read access for parent folder
    await this.setPublicAccess(`${new URL(objectUri).origin}${new URL(objectUri).pathname.split('/').slice(0, -1).join('/')}/`);

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
    subjects: ThingPersisted[] | undefined;
    locations: ThingPersisted[] | undefined;
    persons: ThingPersisted[] | undefined;
    organizations: ThingPersisted[] | undefined;
    events: ThingPersisted[] | undefined;
  } {

    if (!object) {

      throw new ArgumentError('Argument object should be set', object);

    }

    let objectThing = createThing({ url: object.uri });
    const digitalObjectUri = CollectionObjectSolidStore.getDigitalObjectUri(object.uri);

    // identification
    objectThing = object.updated ? addStringNoLocale(objectThing, 'http://schema.org/dateModified', object.updated) : objectThing;
    objectThing = object.type ? addUrl(objectThing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', object.type) : objectThing;
    objectThing = object.additionalType && object.additionalType.length > 0 ? object.additionalType?.reduce((thing, value) => addUrl(thing, 'http://schema.org/additionalType', value.uri), objectThing) : objectThing;
    objectThing = object.identifier ? addStringNoLocale(objectThing, 'http://schema.org/identifier', object.identifier) : objectThing;
    objectThing = object.name ? addStringWithLocale(objectThing, 'http://schema.org/name', object.name, 'nl') : objectThing;
    objectThing = object.description ? addStringWithLocale(objectThing, 'http://schema.org/description', object.description, 'nl') : objectThing;
    objectThing = object.collection ? addUrl(objectThing, 'http://schema.org/isPartOf', object.collection) : objectThing;
    objectThing = object.maintainer ? addUrl(objectThing, 'http://schema.org/maintainer', object.maintainer) : objectThing;

    // creation
    objectThing = object.creator && object.creator?.length > 0 ? object.creator.reduce((thing, value) => addUrl(thing, 'http://schema.org/creator', value.uri), objectThing) : objectThing;
    objectThing = object.locationCreated && object.locationCreated?.length > 0 ? object.locationCreated.reduce((thing, value) => addUrl(thing, 'http://schema.org/locationCreated', value.uri), objectThing) : objectThing;
    objectThing = object.material && object.material?.length > 0 ? object.material.reduce((thing, value) => addUrl(thing, 'http://schema.org/material', value.uri), objectThing) : objectThing;
    objectThing = object.dateCreated ? addStringNoLocale(objectThing, 'http://schema.org/dateCreated', object.dateCreated) : objectThing;

    // representation
    const subjects = object.subject?.map((subject) => {

      let subjectThing = createThing({ url: `${object.uri}-subject-${v5(subject.uri + subject.name, '85af7d4d-ff92-4859-b878-949eef55ce87')}` });
      subjectThing = addUrl(subjectThing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/DefinedTerm');
      subjectThing = addUrl(subjectThing, 'http://schema.org/sameAs', subject.uri);
      subjectThing = addStringNoLocale(subjectThing, 'http://schema.org/name', subject.name);
      objectThing = addUrl(objectThing, 'http://schema.org/about', asUrl(subjectThing));

      return subjectThing;

    });

    const locations = object.location?.map((location) => {

      let locationThing = createThing({ url: `${object.uri}-location-${v5(location.uri + location.name, '85af7d4d-ff92-4859-b878-949eef55ce87')}` });
      locationThing = addUrl(locationThing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Place');
      locationThing = addUrl(locationThing, 'http://schema.org/sameAs', location.uri);
      locationThing = addStringNoLocale(locationThing, 'http://schema.org/name', location.name);
      objectThing = addUrl(objectThing, 'http://schema.org/about', asUrl(locationThing));

      return locationThing;

    });

    const persons = object.person?.map((person) => {

      let personThing = createThing({ url: `${object.uri}-person-${v5(person.uri + person.name, '85af7d4d-ff92-4859-b878-949eef55ce87')}` });
      personThing = addUrl(personThing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Person');
      personThing = addUrl(personThing, 'http://schema.org/sameAs', person.uri);
      personThing = addStringNoLocale(personThing, 'http://schema.org/name', person.name);
      objectThing = addUrl(objectThing, 'http://schema.org/about', asUrl(personThing));

      return personThing;

    });

    const organizations = object.organization?.map((organization) => {

      let organizationThing = createThing({ url: `${object.uri}-organization-${v5(organization.uri + organization.name, '85af7d4d-ff92-4859-b878-949eef55ce87')}` });
      organizationThing = addUrl(organizationThing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Organization');
      organizationThing = addUrl(organizationThing, 'http://schema.org/sameAs', organization.uri);
      organizationThing = addStringNoLocale(organizationThing, 'http://schema.org/name', organization.name);
      objectThing = addUrl(objectThing, 'http://schema.org/about', asUrl(organizationThing));

      return organizationThing;

    });

    const events = object.event?.map((event) => {

      let eventThing = createThing({ url: `${object.uri}-event-${v5(event.uri + event.name, '85af7d4d-ff92-4859-b878-949eef55ce87')}` });
      eventThing = addUrl(eventThing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Event');
      eventThing = addUrl(eventThing, 'http://schema.org/sameAs', event.uri);
      eventThing = addStringNoLocale(eventThing, 'http://schema.org/name', event.name);
      objectThing = addUrl(objectThing, 'http://schema.org/about', asUrl(eventThing));

      return eventThing;

    });

    // dimensions
    let heightThing = createThing({ url: `${object.uri}-height` });

    if (object.height && object.height > 0) {

      heightThing = object.heightUnit ? addStringNoLocale(heightThing, 'http://schema.org/unitCode', object.heightUnit) : heightThing;
      heightThing = addUrl(heightThing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/QuantitativeValue');
      heightThing = addDecimal(heightThing, 'http://schema.org/value', object.height);
      objectThing = addUrl(objectThing, 'http://schema.org/height', asUrl(heightThing));

    }

    let widthThing = createThing({ url: `${object.uri}-width` });

    if (object.width && object.width > 0) {

      widthThing = object.widthUnit ? addStringNoLocale(widthThing, 'http://schema.org/unitCode', object.widthUnit) : widthThing;
      widthThing = addUrl(widthThing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/QuantitativeValue');
      widthThing = addDecimal(widthThing, 'http://schema.org/value', object.width);
      objectThing = addUrl(objectThing, 'http://schema.org/width', asUrl(widthThing));

    }

    let depthThing = createThing({ url: `${object.uri}-depth` });

    if (object.depth && object.depth > 0) {

      depthThing = object.depthUnit ? addStringNoLocale(depthThing, 'http://schema.org/unitCode', object.depthUnit) : depthThing;
      depthThing = addUrl(depthThing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/QuantitativeValue');
      depthThing = addDecimal(depthThing, 'http://schema.org/value', object.depth);
      objectThing = addUrl(objectThing, 'http://schema.org/depth', asUrl(depthThing));

    }

    let weightThing = createThing({ url: `${object.uri}-weight` });

    if (object.weight && object.weight > 0) {

      weightThing = object.weightUnit ? addStringNoLocale(weightThing, 'http://schema.org/unitCode', object.weightUnit) : weightThing;
      weightThing = addUrl(weightThing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/QuantitativeValue');
      weightThing = addDecimal(weightThing, 'http://schema.org/value', object.weight);
      objectThing = addUrl(objectThing, 'http://schema.org/weight', asUrl(weightThing));

    }

    // other
    objectThing =  addUrl(objectThing, 'http://schema.org/mainEntityOfPage', digitalObjectUri);

    // loan
    objectThing =  object.original ? addUrl(objectThing, 'http://netwerkdigitaalerfgoed.nl/voc/original', object.original) : objectThing;

    object.loaned?.forEach((loaned) => {

      objectThing =  loaned ? addUrl(objectThing, 'http://netwerkdigitaalerfgoed.nl/voc/loaned', loaned) : objectThing;

    });

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
      subjects,
      locations,
      persons,
      organizations,
      events,
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
    height: ThingPersisted | undefined,
    width: ThingPersisted | undefined,
    depth: ThingPersisted | undefined,
    weight: ThingPersisted | undefined,
    representations: ThingPersisted[],
    dataset: SolidDataset
  ): CollectionObject {

    if (!object) {

      throw new ArgumentError('Argument object should be set', object);

    }

    if (!digitalObject) {

      throw new ArgumentError('Argument digitalObject should be set', digitalObject);

    }

    if (!representations) {

      throw new ArgumentError('Argument representations should be set', representations);

    }

    if (!dataset) {

      throw new ArgumentError('Argument dataset should be set', dataset);

    }

    return {
      // identification
      uri: asUrl(object),
      updated: getStringNoLocale(object, 'http://schema.org/dateModified') || undefined,
      type: getUrl(object, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') || undefined,
      additionalType: getUrlAll(object, 'http://schema.org/additionalType')?.map((uri) => CollectionObjectSolidStore.getTerm(uri, dataset)),
      identifier: getStringNoLocale(object, 'http://schema.org/identifier') || undefined,
      name: getStringWithLocale(object, 'http://schema.org/name', 'nl') || undefined,
      description: getStringWithLocale(object, 'http://schema.org/description', 'nl') || undefined,
      collection: getUrl(object, 'http://schema.org/isPartOf') || undefined,
      maintainer: getUrl(object, 'http://schema.org/maintainer') || undefined,

      // creation
      creator: getUrlAll(object, 'http://schema.org/creator')?.map((uri) => CollectionObjectSolidStore.getTerm(uri, dataset)),
      locationCreated: getUrlAll(object, 'http://schema.org/locationCreated')?.map((uri) => CollectionObjectSolidStore.getTerm(uri, dataset)),
      material: getUrlAll(object, 'http://schema.org/material')?.map((uri) => CollectionObjectSolidStore.getTerm(uri, dataset)),
      dateCreated: getStringNoLocale(object, 'http://schema.org/dateCreated') || undefined,

      // representation
      subject: representations.filter((thing) => getUrl(thing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') === 'http://schema.org/DefinedTerm')
        .map((thing) => ({
          name: getStringNoLocale(thing, 'http://schema.org/name'),
          uri: getUrl(thing, 'http://schema.org/sameAs'),
        })),
      location: representations.filter((thing) => getUrl(thing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') === 'http://schema.org/Place')
        .map((thing) => ({
          name: getStringNoLocale(thing, 'http://schema.org/name'),
          uri: getUrl(thing, 'http://schema.org/sameAs'),
        })),
      person: representations.filter((thing) => getUrl(thing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') === 'http://schema.org/Person')
        .map((thing) => ({
          name: getStringNoLocale(thing, 'http://schema.org/name'),
          uri: getUrl(thing, 'http://schema.org/sameAs'),
        })),
      organization: representations.filter((thing) => getUrl(thing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') === 'http://schema.org/Organization')
        .map((thing) => ({
          name: getStringNoLocale(thing, 'http://schema.org/name'),
          uri: getUrl(thing, 'http://schema.org/sameAs'),
        })),
      event: representations.filter((thing) => getUrl(thing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') === 'http://schema.org/Event')
        .map((thing) => ({
          name: getStringNoLocale(thing, 'http://schema.org/name'),
          uri: getUrl(thing, 'http://schema.org/sameAs'),
        })),

      // dimensions
      height: height && getDecimal(height, 'http://schema.org/value') !== null ? getDecimal(height, 'http://schema.org/value') : undefined,
      width: width && getDecimal(width, 'http://schema.org/value') !== null ? getDecimal(width, 'http://schema.org/value') : undefined,
      depth: depth && getDecimal(depth, 'http://schema.org/value') !== null ? getDecimal(depth, 'http://schema.org/value') : undefined,
      weight: weight && getDecimal(weight, 'http://schema.org/value') !== null ? getDecimal(weight, 'http://schema.org/value') : undefined,
      heightUnit: height && getStringNoLocale(height, 'http://schema.org/unitCode') !== null ? getStringNoLocale(height, 'http://schema.org/unitCode') : undefined,
      widthUnit: width && getStringNoLocale(width, 'http://schema.org/unitCode') !== null ? getStringNoLocale(width, 'http://schema.org/unitCode') : undefined,
      depthUnit: depth && getStringNoLocale(depth, 'http://schema.org/unitCode') !== null ? getStringNoLocale(depth, 'http://schema.org/unitCode') : undefined,
      weightUnit: weight && getStringNoLocale(weight, 'http://schema.org/unitCode') !== null ? getStringNoLocale(weight, 'http://schema.org/unitCode') : undefined,

      // other
      mainEntityOfPage: asUrl(digitalObject) || undefined,

      // loan
      loaned: getUrlAll(object, 'http://netwerkdigitaalerfgoed.nl/voc/loaned'),
      original: getUrl(object, 'http://netwerkdigitaalerfgoed.nl/voc/original') ?? undefined,

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
   * Uploads an image file to an 'images' directory next to the collection object.
   *
   * @param imageFile The image file to upload.
   * @param objectUri The URI of the related object.
   *
   * @returns The URI of the uploaded image.
   */
  async uploadImage(imageFile: File, objectUri: string): Promise<string> {

    if (!imageFile) {

      throw new ArgumentError('Argument imageFile should be set.', imageFile);

    }

    if (!objectUri) {

      throw new ArgumentError('Argument objectUri should be set.', objectUri);

    }

    const savedFile = await saveFileInContainer(
      `${new URL(objectUri).origin}${new URL(objectUri).pathname.split('/').slice(0, -1).join('/')}/`,
      imageFile,
      { slug: `${v4().split('-')[0]}-${imageFile.name}`, contentType: imageFile.type, fetch: this.getSession().fetch }
    );

    const imageUri = savedFile.internal_resourceInfo.sourceIri;

    // set public access for this image
    await this.setPublicAccess(imageUri);

    return imageUri;

  }

  /**
   * Retrieves the URI of the digital object for a given CollectionObject
   *
   * @param objectUri The uri of the object to get the digital object uri from
   */
  static getDigitalObjectUri(objectUri: string): string {

    if (!objectUri) {

      throw new ArgumentError('Argument objectUri should be set.', objectUri);

    }

    if (objectUri.trim().length < 1) {

      throw new ArgumentError('Argument objectUri can not be empty.', objectUri);

    }

    return `${objectUri}-digital`;

  }

  /**
   * Retrieves the name of a given Term
   * Temporary function while individual Term lookups are not possible
   *
   * @param uri The uri of the Term
   * @param dataset The related object's URI, in which the Term's name is saved
   */
  static getTerm(uri: string, dataset: SolidDataset): Term {

    if (!uri) {

      throw new ArgumentError('Argument uri should be set.', uri);

    }

    if (!dataset) {

      throw new ArgumentError('Argument dataset should be set.', dataset);

    }

    const termThing = getThing(dataset, uri);

    if (!termThing) {

      throw new ArgumentError('No Thing found for uri.', { uri, dataset });

    }

    const name = getStringNoLocale(termThing, 'http://schema.org/name');

    if (!name) {

      throw new ArgumentError('Could not find name in dataset', name);

    }

    return { name, uri };

  }

  /**
   * Sends metadata update notification to the original object.
   *
   * @param original The original object's URI
   * @param updated The updated object
   */
  private async sendMetadataUpdate(original: string, updated: CollectionObject): Promise<string> {

    // eslint-disable-next-line no-console
    console.log('sending metadata update');

    const originalObject = await this.get(original);
    const originalObjectInbox = await this.getInbox(originalObject);

    const notificationId = v4();

    const body = this.createNotificationBody({
      inbox: originalObjectInbox,
      notificationId,
      type: 'https://www.w3.org/ns/activitystreams#Update',
      summary: 'Object metadata update',
      actor: this.getSession().info.webId ?? '',
      target: originalObject.maintainer ?? '',
      object: updated.uri,
    });

    const response = await fetch(originalObjectInbox, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/turtle',
        'Slug': notificationId,
      },
      body,
    });

    const notificationUri = response.headers.get('Location');

    if (notificationUri === null) {

      // eslint-disable-next-line no-console
      console.error(response);
      throw Error('error while sending metadata update notif');

    }

    return notificationUri;

  }

  async getInbox(object: CollectionObject): Promise<string> {

    // retrieve collection
    const dataset = await getSolidDataset(object.collection, { fetch: this.getSession().fetch });
    const collectionThing = getThing(dataset, object.collection);

    if (!collectionThing) {

      throw new ArgumentError('Could not find collectionThing in dataset', collectionThing);

    }

    const inbox = getUrl(collectionThing, 'http://www.w3.org/ns/ldp#inbox');

    if (!inbox) {

      throw Error(`could not find inbox for ${asUrl(collectionThing)}`);

    }

    return inbox;

  }

  /**
   * Creates a notification body in text/turtle
   */
  private createNotificationBody = (notificationArgs: {
    inbox: string;
    notificationId: string;
    type: string;
    summary: string;
    actor: string;
    target: string;
    object: string;
    origin?: string;
  }): string => `@prefix as: <https://www.w3.org/ns/activitystreams#> .

<${notificationArgs.inbox}${notificationArgs.notificationId}>
  a <${notificationArgs.type}> ;
  as:summary "${notificationArgs.summary}" ;  
  as:actor <${notificationArgs.actor}> ;
  as:target <${notificationArgs.target}> ;
  as:object <${notificationArgs.object}> ;
  as:origin <${notificationArgs.origin ?? `https://webid.netwerkdigitaalerfgoed.nl/collectiebeheersysteem`}> .
`;

}
