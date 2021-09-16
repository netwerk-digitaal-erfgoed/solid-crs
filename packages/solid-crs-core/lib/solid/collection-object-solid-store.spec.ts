import * as client from '@netwerk-digitaal-erfgoed/solid-crs-client';
import { getStringNoLocale, getStringWithLocale, getUrl } from '@netwerk-digitaal-erfgoed/solid-crs-client';
import { Collection } from '../collections/collection';
import { CollectionObject } from '../collections/collection-object';
import { CollectionObjectSolidStore } from './collection-object-solid-store';

describe('CollectionObjectSolidStore', () => {

  let service: CollectionObjectSolidStore;

  let mockCollection: Collection;
  let mockObject: CollectionObject;

  beforeEach(() => {

    service = new CollectionObjectSolidStore();

    jest.resetAllMocks();
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();

    mockCollection = {
      uri: 'http://test.uri/',
      name: 'test-name',
      description: 'test-description',
      objectsUri: 'http://test.url',
      distribution: undefined,
    };

    mockObject = {
      uri: 'http://test.uri/',
      collection: mockCollection.uri,
      name: 'test-name',
      description: 'test-description',
      type: 'http://test.type',
      image: 'http://test.image',
      mainEntityOfPage: 'http://test.uri/',
      additionalType: [ { name: 'additionalType', uri: 'https://uri/' } ],
      weight: 2,
      height: 2,
      depth: 2,
      width: 2,
      weightUnit: 'KGM',
      heightUnit: 'CMT',
      depthUnit: 'CMT',
      widthUnit: 'CMT',
      subject: [ { name: 'subject', uri: 'https://uri/' } ],
      location: [ { name: 'location', uri: 'https://uri/' } ],
      person: [ { name: 'person', uri: 'https://uri/' } ],
      organization: [ { name: 'organization', uri: 'https://uri/' } ],
      event: [ { name: 'event', uri: 'https://uri/' } ],
    };

  });

  it('should instantiate', () => {

    expect(service).toBeTruthy();

  });

  describe('getObjectsForCollection()', () => {

    it.each([ null, undefined ])('should error when collection is %s', async (value) => {

      await expect(service.getObjectsForCollection(value)).rejects.toThrow('Argument collection should be set');

    });

    it('should return empty list when no dataset was found', async () => {

      client.getSolidDataset = jest.fn(async () => null);

      await expect(service.getObjectsForCollection(mockCollection)).resolves.toEqual([]);

    });

    it('should return empty list when no object was found', async () => {

      client.getSolidDataset = jest.fn(async () => 'test-dataset');
      client.getThingAll = jest.fn(() => []);

      await expect(service.getObjectsForCollection(mockCollection)).resolves.toEqual([]);

    });

    it('should return collection objects', async () => {

      let objectThing = client.createThing({ url: mockObject.uri });
      objectThing = client.addUrl(objectThing, 'http://schema.org/isPartOf', mockCollection.uri);

      client.getUrl = jest.fn(() => mockCollection.uri);
      client.getUrlAll = jest.fn(() => [ 'test-url' ]);
      client.getSolidDataset = jest.fn(async () => 'test-dataset');
      client.getThingAll = jest.fn(() => [ objectThing ]);
      client.getThing = jest.fn(() => objectThing);

      const result = await service.getObjectsForCollection(mockCollection);

      expect(result.length).toBeTruthy();

      expect(result[0]).toEqual(expect.objectContaining({
        uri: mockObject.uri,
        collection: mockCollection.uri,
      }));

    });

    it('should set default uris for related object when not found', async () => {

      let objectThing = client.createThing({ url: mockObject.uri });
      objectThing = client.addUrl(objectThing, 'http://schema.org/isPartOf', mockCollection.uri);

      client.getSolidDataset = jest.fn(async () => 'test-dataset');
      client.getThing = jest.fn(() => client.createThing({ url: mockObject.uri }));
      client.getThingAll = jest.fn(() => [ objectThing ]);
      client.getUrl = jest.fn((thing, uri) => uri === 'http://schema.org/isPartOf' ? 'http://test.uri/' : null);
      client.getUrlAll = jest.fn(() => [ 'test-url' ]);

      const url = mockObject.uri;
      const result = await service.getObjectsForCollection(mockCollection);

      expect(result).toBeTruthy();

      expect(client.getThing.mock.calls).toEqual([
        [ 'test-dataset', CollectionObjectSolidStore.getDigitalObjectUri(url) ],
        [ 'test-dataset', `${url}-height` ],
        [ 'test-dataset', `${url}-width` ],
        [ 'test-dataset', `${url}-depth` ],
        [ 'test-dataset', `${url}-weight` ],
        // representation items
        [ 'test-dataset', `test-url` ],
        [ 'test-dataset', `test-url` ],
        [ 'test-dataset', `test-url` ],
        [ 'test-dataset', `test-url` ],
        [ 'test-dataset', `test-url` ],
      ]);

    });

  });

  describe('get()', () => {

    it.each([ null, undefined ])('should error when uri is %s', async (value) => {

      await expect(service.get(value)).rejects.toThrow('Argument uri should be set');

    });

    it('should return collection object', async () => {

      client.getSolidDataset = jest.fn(async () => 'test-dataset');
      client.getThing = jest.fn(() => client.createThing());
      client.getUrl = jest.fn(() => 'test-url');
      client.getUrlAll = jest.fn(() => [ 'test-url' ]);
      client.getStringWithLocale = jest.fn(() => 'test-string');
      client.getStringNoLocale = jest.fn(() => 'test-string');
      client.getInteger = jest.fn(() => 1);
      client.getDecimal = jest.fn(() => 1);
      client.asUrl = jest.fn(() => 'test-url');

      await expect(service.get('test-url')).resolves.toEqual(
        expect.objectContaining({
          uri: 'test-url',
          name: 'test-string',
          description: 'test-string',
        }),
      );

    });

    it('should set default uris for related object when not found', async () => {

      client.getSolidDataset = jest.fn(async () => 'test-dataset');
      client.getThing = jest.fn(() => client.createThing());
      client.getUrl = jest.fn(() => null);
      client.getUrlAll = jest.fn(() => [ 'test-url' ]);

      const url = 'test-url';
      const result = await service.get('test-url');

      expect(result).toBeTruthy();

      expect(client.getThing.mock.calls).toEqual([
        [ 'test-dataset', url ],
        [ 'test-dataset', CollectionObjectSolidStore.getDigitalObjectUri(url) ],
        [ 'test-dataset', `${url}-height` ],
        [ 'test-dataset', `${url}-width` ],
        [ 'test-dataset', `${url}-depth` ],
        [ 'test-dataset', `${url}-weight` ],
        // representation items
        [ 'test-dataset', `test-url` ],
        [ 'test-dataset', `test-url` ],
        [ 'test-dataset', `test-url` ],
        [ 'test-dataset', `test-url` ],
        [ 'test-dataset', `test-url` ],
      ]);

    });

  });

  describe('all()', () => {

    it('should throw', async () => {

      await expect(service.all()).rejects.toThrow();

    });

  });

  describe('delete()', () => {

    it.each([ null, undefined ])('should error when object is %s', async (value) => {

      await expect(service.delete(value)).rejects.toThrow('Argument object should be set');

    });

    it('should return collection when deleted', () => {

      client.getSolidDataset = jest.fn(async () => 'test-dataset');
      client.getThing = jest.fn(() => client.createThing());
      client.removeUrl = jest.fn(() => 'test-thing');
      client.setThing = jest.fn(() => 'test-dataset');
      client.removeThing = jest.fn(() => 'test-thing');
      client.getUrl = jest.fn(() => 'test-url');
      client.getUrlAll = jest.fn(() => [ 'test-url' ]);
      client.saveSolidDatasetAt = jest.fn(async () => 'test-dataset');
      client.deleteFile = jest.fn(async () => 'test-file');

      expect(service.delete(mockObject)).resolves.toEqual(mockObject);

    });

  });

  describe('save()', () => {

    it.each([ null, undefined ])('should error when object is %s', async (value) => {

      await expect(service.save(value)).rejects.toThrow('Argument object should be set');

    });

    it('should error when object does not contain collection uri', async () => {

      delete mockObject.collection;

      await expect(service.save(mockObject)).rejects.toThrow('The object must be linked to a collection');

    });

    it('should return object when saved', async () => {

      client.getSolidDataset = jest.fn(async () => 'test-dataset');
      client.getThing = jest.fn(() => client.createThing());
      client.getUrl = jest.fn(() => 'http://test-uri/');
      client.getUrlAll = jest.fn(() => [ 'http://test-uri/' ]);
      client.setThing = jest.fn(() => 'test-thing');
      client.removeThing = jest.fn(() => 'test-thing');
      client.saveSolidDatasetAt = jest.fn(async () => 'test-dataset');
      client.addUrl = jest.fn(() => 'test-url');
      client.addStringNoLocale = jest.fn(() => 'test-url');
      client.addStringWithLocale = jest.fn(() => 'test-url');
      client.addInteger = jest.fn(() => 'test-url');
      client.addDecimal = jest.fn(() => 'test-url');

      const result = await service.save(mockObject)
;

      expect(result).toEqual(expect.objectContaining({
        description: mockObject.description,
        image: mockObject.image,
        name: mockObject.name,
        type: mockObject.type,
        subject: [ { name: 'subject', uri: 'https://uri/' } ],
      }));

      expect(result.uri).toMatch(/http:\/\/test-uri\/#.*/i);

    });

    it('should return object with new uri when it was not set', async () => {

      delete mockObject.uri;

      client.getSolidDataset = jest.fn(async () => 'test-dataset');
      client.getThing = jest.fn(() => client.createThing());
      client.getUrl = jest.fn(() => 'http://test-url/');
      client.setThing = jest.fn(() => 'test-thing');
      client.removeThing = jest.fn(() => 'test-thing');
      client.saveSolidDatasetAt = jest.fn(async () => 'test-dataset');

      const result = await service.save(mockObject);

      expect(result).toEqual(expect.objectContaining({ ...mockObject }));
      expect(result.uri).toBeTruthy();

    });

    it('should not set undefined properties', async() => {

      client.getSolidDataset = jest.fn(async () => 'test-dataset');
      client.getThing = jest.fn(() => client.createThing());
      client.getUrl = jest.fn(() => 'http://test-uri/');
      client.getUrlAll = jest.fn(() => [  ]);
      client.setThing = jest.fn(() => 'test-thing');
      client.removeThing = jest.fn(() => 'test-thing');
      client.saveSolidDatasetAt = jest.fn(async () => 'test-dataset');
      client.addUrl = jest.fn(() => 'test-url');
      client.addStringNoLocale = jest.fn(() => 'test-url');
      client.addStringWithLocale = jest.fn(() => 'test-url');
      client.addInteger = jest.fn(() => 'test-url');
      client.addDecimal = jest.fn(() => 'test-url');

      const objectWithoutSubject = {
        ...mockObject,
        subject: undefined,
        location: undefined,
        person: undefined,
        organization: undefined,
        event: undefined,
      };

      const result = await service.save(objectWithoutSubject)
;

      expect(result).toEqual(expect.objectContaining({
        description: objectWithoutSubject.description,
        image: objectWithoutSubject.image,
        name: objectWithoutSubject.name,
        type: objectWithoutSubject.type,
        subject: undefined,
        location: undefined,
        person: undefined,
        organization: undefined,
        event: undefined,
      }));

    });

  });

  describe('toThing()', () => {

    it('should error when object is null', () => {

      expect(() => CollectionObjectSolidStore.toThing(null)).toThrow('Argument object should be set');

    });

    it('should not add undefined properties to thing', () => {

      const mockObject2 = { uri: mockObject.uri } as CollectionObject;

      const { object: result } = CollectionObjectSolidStore.toThing(mockObject2);

      client.addDecimal = jest.fn((thing) => thing);
      client.addStringNoLocale = jest.fn((thing) => thing);

      expect(getStringNoLocale(result, 'http://schema.org/dateModified')).toBeFalsy();
      expect(getUrl(result, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type')).toBeFalsy();
      expect(getStringWithLocale(result, 'http://schema.org/additionalType', 'nl')).toBeFalsy();
      expect(getStringNoLocale(result, 'http://schema.org/identifier')).toBeFalsy();
      expect(getStringWithLocale(result, 'http://schema.org/name', 'nl')).toBeFalsy();
      expect(getStringWithLocale(result, 'http://schema.org/description', 'nl')).toBeFalsy();
      expect(getUrl(result, 'http://schema.org/isPartOf')).toBeFalsy();
      expect(getUrl(result, 'http://schema.org/maintainer')).toBeFalsy();
      expect(getStringNoLocale(result, 'http://schema.org/creator')).toBeFalsy();
      expect(getStringNoLocale(result, 'http://schema.org/locationCreated')).toBeFalsy();
      expect(getStringNoLocale(result, 'http://schema.org/material')).toBeFalsy();
      expect(getStringNoLocale(result, 'http://schema.org/dateCreated')).toBeFalsy();
      expect(getStringNoLocale(result, 'http://schema.org/DefinedTerm')).toBeFalsy();
      expect(getStringNoLocale(result, 'http://schema.org/Place')).toBeFalsy();
      expect(getStringNoLocale(result, 'http://schema.org/Person')).toBeFalsy();
      expect(getStringNoLocale(result, 'http://schema.org/Organization')).toBeFalsy();
      expect(getStringNoLocale(result, 'http://schema.org/Event')).toBeFalsy();
      expect(getUrl(result, 'http://schema.org/height')).toBeFalsy();
      expect(getUrl(result, 'http://schema.org/width')).toBeFalsy();
      expect(getUrl(result, 'http://schema.org/depth')).toBeFalsy();
      expect(getUrl(result, 'http://schema.org/weight')).toBeFalsy();
      expect(getUrl(result, 'http://schema.org/image')).toBeFalsy();
      expect(getUrl(result, 'http://schema.org/mainEntityOfPage')).toBeFalsy();
      expect(getUrl(result, 'http://schema.org/license')).toBeFalsy();

    });

    it('should convert object properties to thing', () => {

      const mockObject2 = {
        ...mockObject,
        updated: 'test',
        type: 'http://test.url/',
        additionalType: [ { uri: 'http://test/', name: 'additionalType' } ],
        identifier: 'test',
        name: 'test',
        description: 'test',
        collection: 'http://test.url/',
        maintainer: 'http://test.url/',
        creator: [ { uri: 'http://test/', name: 'creator' } ],
        locationCreated: [ { uri: 'http://test/', name: 'locationCreated' } ],
        material: [ { uri: 'http://test/', name: 'material' } ],
        dateCreated: 'test',
        subject: [ { uri: 'http://test/', name: 'subject' } ],
        location: [ { uri: 'http://test/', name: 'location' } ],
        person: [ { uri: 'http://test/', name: 'person' } ],
        organization: [ { uri: 'http://test/', name: 'organization' } ],
        event: [ { uri: 'http://test/', name: 'event' } ],
        height: 2,
        width: 2,
        depth: 2,
        weight: 2,
        heightUnit: 'CMT',
        widthUnit: 'CMT',
        depthUnit: 'CMT',
        weightUnit: 'KGM',
        image: 'http://test.url/',
        mainEntityOfPage: 'http://test.url',
        license: 'http://test.url',
      } as CollectionObject;

      const result = CollectionObjectSolidStore.toThing(mockObject2);

      expect(result).toBeTruthy();

    });

  });

  describe('fromThing()', () => {

    it.each([
      'object',
      'digitalObject',
      'representations',
      'dataset',
    ])('should error when object.%s is not set', (value) => {

      const thing = client.createThing({ url: mockObject.uri });

      const params = {
        object: thing,
        digitalObject: thing,
        height: thing,
        width: thing,
        depth: thing,
        weight: thing,
        representations: [ thing ],
        dataset: thing,
      };

      params[value] = null;

      expect(() => CollectionObjectSolidStore.fromThing(
        params.object,
        params.digitalObject,
        params.height,
        params.width,
        params.depth,
        params.weight,
        params.representations,
        params.dataset
      )).toThrow();

    });

    it('should set properties to undefined when not in Thing', () => {

      client.getUrl = jest.fn(() => undefined);
      client.getStringNoLocale = jest.fn(() => undefined);
      client.getUrlAll = jest.fn(() => [ ]);
      client.getStringWithLocale = jest.fn(() => undefined);
      client.asUrl = jest.fn(() => undefined);

      const objectThing = client.createThing({ url: mockObject.uri });
      client.getThing = jest.fn(() => objectThing);

      const result = CollectionObjectSolidStore.fromThing(
        objectThing,
        objectThing,
        objectThing,
        objectThing,
        objectThing,
        objectThing,
        [ objectThing ],
        objectThing
      );

      expect(result.updated).toEqual(undefined);
      expect(result.type).toEqual(undefined);
      expect(result.additionalType).toEqual([]);
      expect(result.identifier).toEqual(undefined);
      expect(result.name).toEqual(undefined);
      expect(result.description).toEqual(undefined);
      expect(result.collection).toEqual(undefined);
      expect(result.maintainer).toEqual(undefined);
      expect(result.creator).toEqual([]);
      expect(result.locationCreated).toEqual([]);
      expect(result.material).toEqual([]);
      expect(result.dateCreated).toEqual(undefined);
      expect(result.image).toEqual(undefined);
      expect(result.mainEntityOfPage).toEqual(undefined);
      expect(result.subject).toEqual([]);
      expect(result.height).toEqual(undefined);
      expect(result.width).toEqual(undefined);
      expect(result.depth).toEqual(undefined);
      expect(result.weight).toEqual(undefined);
      expect(result.heightUnit).toEqual(undefined);
      expect(result.widthUnit).toEqual(undefined);
      expect(result.depthUnit).toEqual(undefined);
      expect(result.weightUnit).toEqual(undefined);

    });

    it('should set Terms correctly', () => {

      const subjectThing = client.createThing({ url: `${mockObject.uri}subject` });
      const locationThing = client.createThing({ url: `${mockObject.uri}location` });
      const personThing = client.createThing({ url: `${mockObject.uri}person` });
      const organizationThing = client.createThing({ url: `${mockObject.uri}organization` });
      const eventThing = client.createThing({ url: `${mockObject.uri}event` });

      client.getUrl = jest.fn((thing, uri) => {

        if (uri.includes('#type')) {

          if (thing === subjectThing) {

            return 'http://schema.org/DefinedTerm';

          } else if (thing === locationThing) {

            return 'http://schema.org/Place';

          } else if (thing === personThing) {

            return 'http://schema.org/Person';

          } else if (thing === organizationThing) {

            return 'http://schema.org/Organization';

          } else if (thing === eventThing) {

            return 'http://schema.org/Event';

          } else {

            return 'https://test.url/';

          }

        } else {

          return 'https://test.url/';

        }

      });

      client.getStringNoLocale = jest.fn(() => 'test-string');
      client.getUrlAll = jest.fn(() => [ 'https://test.url/' ]);
      client.getStringWithLocale = jest.fn(() => 'test-string');
      client.asUrl = jest.fn(() => 'https://test.url/');

      const objectThing = client.createThing({ url: mockObject.uri });
      client.getThing = jest.fn(() => objectThing);

      const result = CollectionObjectSolidStore.fromThing(
        objectThing,
        objectThing,
        objectThing,
        objectThing,
        objectThing,
        objectThing,
        [
          subjectThing,
          locationThing,
          personThing,
          organizationThing,
          eventThing,
        ],
        objectThing
      );

      expect(result.additionalType).toContainEqual({ name: 'test-string', uri: 'https://test.url/' });
      expect(result.creator).toContainEqual({ name: 'test-string', uri: 'https://test.url/' });
      expect(result.locationCreated).toContainEqual({ name: 'test-string', uri: 'https://test.url/' });
      expect(result.material).toContainEqual({ name: 'test-string', uri: 'https://test.url/' });
      expect(result.subject).toContainEqual({ name: 'test-string', uri: 'https://test.url/' });

    });

  });

  describe('search()', () => {

    it.each([ null, undefined ])('should error when objects is %s', async (value) => {

      await expect(service.search('searchterm', value)).rejects.toThrow('Argument objects should be set');

    });

    it.each([ null, undefined ])('should error when searchTerm is %s', async (value) => {

      await expect(service.search(value, [ mockObject ])).rejects.toThrow('Argument searchTerm should be set');

    });

    it('should return filtered list', async () => {

      const objects = [ mockObject, mockObject, { ...mockObject, name: undefined } ];

      const result = await service.search(mockObject.name, objects);
      expect(result).toBeTruthy();
      expect(result.length).toEqual(2);

    });

  });

  describe('getDigitalObjectUri()', () => {

    it('should error when object is null', () => {

      expect(() => CollectionObjectSolidStore.getDigitalObjectUri(null)).toThrow();

    });

    it('should error when object is empty', () => {

      expect(() => CollectionObjectSolidStore.getDigitalObjectUri('    ')).toThrow();

    });

    it('should error when object uri is not set', () => {

      delete mockObject.uri;

      expect(() => CollectionObjectSolidStore.getDigitalObjectUri(mockObject.uri)).toThrow();

    });

    it('should return correct uri', () => {

      expect(CollectionObjectSolidStore.getDigitalObjectUri(mockObject.uri)).toEqual(`${mockObject.uri}-digital`);

    });

  });

  describe('getTerm()', () => {

    it.each([ null, undefined ])('should error when dataset is %s', (value) => {

      expect(() => CollectionObjectSolidStore.getTerm('uri', value)).toThrow('Argument dataset should be set');

    });

    it.each([ null, undefined ])('should error when uri is %s', (value) => {

      expect(() => CollectionObjectSolidStore.getTerm(value, client.createSolidDataset())).toThrow('Argument uri should be set');

    });

    it('should error when Thing not found in dataset', () => {

      client.getThing = jest.fn(() => undefined);

      expect(() => CollectionObjectSolidStore.getTerm('uri', client.createSolidDataset())).toThrow('No Thing found for uri');

    });

    it('should return correct Thing when present', () => {

      const termUri = 'https://test.url/';
      const termName = 'name';
      const termThing = client.createThing({ url: termUri });

      client.getStringNoLocale = jest.fn(() => termName);
      client.getThing = jest.fn(() => termThing);

      expect(CollectionObjectSolidStore.getTerm(termUri, client.createSolidDataset()))
        .toEqual({ uri: termUri, name: termName });

    });

  });

});
