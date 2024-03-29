/* eslint-disable @typescript-eslint/no-explicit-any */
import * as client from '@netwerk-digitaal-erfgoed/solid-crs-client';
import { getStringNoLocale, getStringWithLocale, getUrl, WithResourceInfo } from '@netwerk-digitaal-erfgoed/solid-crs-client';
import fetchMock from 'jest-fetch-mock';
import { Collection } from '../collections/collection';
import { CollectionObject } from '../collections/collection-object';
import { CollectionObjectSolidStore } from './collection-object-solid-store';

describe('CollectionObjectSolidStore', () => {

  let service: CollectionObjectSolidStore;

  let mockCollection: Collection;
  let mockObject: CollectionObject;

  const solidService = {
    getDefaultSession: jest.fn(() => ({
      info: {
        webId: 'https://example.com/profile/card#me',
      },
      fetch,
    })),
  } as any;

  beforeEach(() => {

    service = new CollectionObjectSolidStore(solidService);

    jest.resetAllMocks();
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();

    mockCollection = {
      uri: 'http://test.uri/',
      name: 'test-name',
      description: 'test-description',
      objectsUri: 'http://test.url',
      inbox: '',
      publisher: '',
      distribution: '',
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

    (service.uploadImage as any) = jest.fn(async () => 'http://test.image');

    (service.getSession as any) = jest.fn(() => ({
      info: {
        webId: 'https://example.com/profile/card#me',
      },
      fetch,
    }));

  });

  it('should instantiate', () => {

    expect(service).toBeTruthy();

  });

  describe('getObjectsForCollection()', () => {

    it.each([ null, undefined ])('should error when collection is %s', async (value) => {

      await expect(service.getObjectsForCollection(value)).rejects.toThrow('Argument collection should be set');

    });

    it('should error when no digitalObject was found in dataset', async () => {

      let objectThing = client.createThing({ url: mockObject.uri });
      objectThing = client.addUrl(objectThing, 'http://schema.org/isPartOf', mockCollection.uri);

      (client.getSolidDataset as any) = jest.fn(async () => 'test-dataset');
      (client.getThingAll as any) = jest.fn(() => [ objectThing ]);
      (client.getThing as any) = jest.fn(() => undefined);

      await expect(service.getObjectsForCollection(mockCollection)).rejects.toThrow('Could not find digitalObject in dataset');

    });

    it('should return empty list when no dataset was found', async () => {

      (client.getSolidDataset as any) = jest.fn(async () => null);

      await expect(service.getObjectsForCollection(mockCollection)).resolves.toEqual([]);

    });

    it('should return empty list when no object was found', async () => {

      (client.getSolidDataset as any) = jest.fn(async () => 'test-dataset');
      (client.getThingAll as any) = jest.fn(() => []);

      await expect(service.getObjectsForCollection(mockCollection)).resolves.toEqual([]);

    });

    it('should return collection objects', async () => {

      let objectThing = client.createThing({ url: mockObject.uri });
      objectThing = client.addUrl(objectThing, 'http://schema.org/isPartOf', mockCollection.uri);

      (client.getUrl as any) = jest.fn(() => mockCollection.uri);
      (client.getUrlAll as any) = jest.fn(() => [ 'test-url' ]);
      (client.getSolidDataset as any) = jest.fn(async () => 'test-dataset');
      (client.getThingAll as any) = jest.fn(() => [ objectThing ]);
      (client.getThing as any) = jest.fn(() => objectThing);
      (client.getStringNoLocale as any) = jest.fn(() => 'name');

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

      (client.getSolidDataset as any) = jest.fn(async () => 'test-dataset');
      (client.getThing as any) = jest.fn(() => client.createThing({ url: mockObject.uri }));
      (client.getThingAll as any) = jest.fn(() => [ objectThing ]);
      (client.getUrl as any) = jest.fn((thing, uri) => uri === 'http://schema.org/isPartOf' ? 'http://test.uri/' : null);
      (client.getUrlAll as any) = jest.fn(() => [ 'test-url' ]);
      (client.getStringNoLocale as any) = jest.fn(() => 'name');

      const url = mockObject.uri;
      const result = await service.getObjectsForCollection(mockCollection);

      expect(result).toBeTruthy();

      expect((client.getThing as any).mock.calls).toEqual([
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

      await expect(service.get(value as unknown as string)).rejects.toThrow('Argument uri should be set');

    });

    it('should error when no object thing was found', async () => {

      (client.getSolidDataset as any) = jest.fn(async () => 'test-dataset');
      (client.getThing as any) = jest.fn(() => undefined);

      await expect(service.get('test-uri')).rejects.toThrow('Could not find objectThing in dataset');

    });

    it('should error when no digital object was found', async () => {

      (client.getSolidDataset as any) = jest.fn(async () => 'test-dataset');
      (client.getThing as any) = jest.fn((d, uri) => uri === 'test-uri' ? 'test-thing' : undefined);
      (client.getUrl as any) = jest.fn(() => 'test-url');

      await expect(service.get('test-uri')).rejects.toThrow('Could not find digitalObject in dataset');

    });

    it('should return collection object', async () => {

      (client.getSolidDataset as any) = jest.fn(async () => 'test-dataset');
      (client.getThing as any) = jest.fn(() => client.createThing());
      (client.getUrl as any) = jest.fn(() => 'test-url');
      (client.getUrlAll as any) = jest.fn(() => [ 'test-url' ]);
      (client.getStringWithLocale as any) = jest.fn(() => 'test-string');
      (client.getStringNoLocale as any) = jest.fn(() => 'test-string');
      (client.getInteger as any) = jest.fn(() => 1);
      (client.getDecimal as any) = jest.fn(() => 1);
      (client.asUrl as any) = jest.fn(() => 'test-url');

      await expect(service.get('test-url')).resolves.toEqual(
        expect.objectContaining({
          uri: 'test-url',
          name: 'test-string',
          description: 'test-string',
        }),
      );

    });

    it('should set default uris for related object when not found', async () => {

      (client.getSolidDataset as any) = jest.fn(async () => 'test-dataset');
      (client.getThing as any) = jest.fn(() => client.createThing());
      (client.getUrl as any) = jest.fn(() => null);
      (client.getUrlAll as any) = jest.fn(() => [ 'test-url' ]);
      (client.asUrl as any) = jest.fn(() => 'test-url');
      (client.getStringNoLocale as any) = jest.fn(() => 'name');

      const url = 'test-url';
      const result = await service.get('test-url');

      expect(result).toBeTruthy();

      expect((client.getThing as any).mock.calls).toEqual([
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

      await expect(service.delete(value as unknown as CollectionObject)).rejects.toThrow('Argument object should be set');

    });

    it('should return collection when deleted', () => {

      (client.getSolidDataset as any) = jest.fn(async () => 'test-dataset');
      (client.getThing as any) = jest.fn(() => client.createThing());
      (client.removeUrl as any) = jest.fn(() => 'test-thing');
      (client.setThing as any) = jest.fn(() => 'test-dataset');
      (client.removeThing as any) = jest.fn(() => 'test-thing');
      (client.getUrl as any) = jest.fn(() => 'test-url');
      (client.getUrlAll as any) = jest.fn(() => [ 'test-url' ]);
      (client.saveSolidDatasetAt as any) = jest.fn(async () => 'test-dataset');
      (client.deleteFile as any) = jest.fn(async () => 'test-file');

      expect(service.delete(mockObject)).resolves.toEqual(mockObject);

    });

  });

  describe('save()', () => {

    beforeEach(() => {

      (service.setPublicAccess as any) = jest.fn(async() => true);

    });

    it.each([ null, undefined ])('should error when object is %s', async (value) => {

      await expect(service.save(value as unknown as CollectionObject)).rejects.toThrow('Argument object should be set');

    });

    it('should error when object does not contain collection uri', async () => {

      delete mockObject.collection;

      await expect(service.save(mockObject)).rejects.toThrow('The object must be linked to a collection');

    });

    it('should error when no collection thing was found', async () => {

      (client.getSolidDataset as any) = jest.fn(async () => 'test-dataset');
      (client.getThing as any) = jest.fn(() => undefined);

      await expect(service.save(mockObject)).rejects.toThrow('Could not find collectionThing in dataset');

    });

    it('should error when no distribution uri was found', async () => {

      (client.getSolidDataset as any) = jest.fn(async () => 'test-dataset');
      (client.getThing as any) = jest.fn(() => client.createThing());
      (client.getUrl as any) = jest.fn(() => undefined);

      await expect(service.save(mockObject)).rejects.toThrow('Could not find distributionUri in dataset');

    });

    it('should error when no distribution thing was found', async () => {

      (client.getSolidDataset as any) = jest.fn(async () => 'test-dataset');

      (client.getThing as any) = jest.fn((d, uri) => {

        if (uri === 'http://test-uri/') {

          return undefined;

        }

        return client.createThing();

      });

      (client.getUrl as any) = jest.fn(() => 'http://test-uri/');

      await expect(service.save(mockObject)).rejects.toThrow('Could not find distributionThing in dataset');

    });

    it('should error when no content (objects) uri was found', async () => {

      (client.getSolidDataset as any) = jest.fn(async () => 'test-dataset');
      (client.getThing as any) = jest.fn(() => client.createThing());

      (client.getUrl as any) = jest.fn((t, pred) => {

        if (pred === 'http://schema.org/contentUrl') {

          return undefined;

        }

        return 'test-url';

      });

      await expect(service.save(mockObject)).rejects.toThrow('Could not find contentUrl in dataset');

    });

    it('should return object when saved', async () => {

      (client.getSolidDataset as any) = jest.fn(async () => 'test-dataset');
      (client.getThing as any) = jest.fn(() => client.createThing());
      (client.getUrl as any) = jest.fn(() => 'http://test-uri/');
      (client.getUrlAll as any) = jest.fn(() => [ 'http://test-uri/' ]);
      (client.setThing as any) = jest.fn(() => 'test-thing');
      (client.removeThing as any) = jest.fn(() => 'test-thing');
      (client.saveSolidDatasetAt as any) = jest.fn(async () => 'test-dataset');
      (client.addUrl as any) = jest.fn(() => 'test-url');
      (client.addStringNoLocale as any) = jest.fn(() => 'test-url');
      (client.addStringWithLocale as any) = jest.fn(() => 'test-url');
      (client.addInteger as any) = jest.fn(() => 'test-url');
      (client.addDecimal as any) = jest.fn(() => 'test-url');

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

      (client.getSolidDataset as any) = jest.fn(async () => 'test-dataset');
      (client.getThing as any) = jest.fn(() => client.createThing());
      (client.getUrl as any) = jest.fn(() => 'http://test-url/');
      (client.setThing as any) = jest.fn(() => 'test-thing');
      (client.removeThing as any) = jest.fn(() => 'test-thing');
      (client.saveSolidDatasetAt as any) = jest.fn(async () => 'test-dataset');

      const result = await service.save(mockObject);

      expect(result).toEqual(expect.objectContaining({ ...mockObject }));
      expect(result.uri).toBeTruthy();

    });

    it('should not set undefined properties', async() => {

      (client.getSolidDataset as any) = jest.fn(async () => 'test-dataset');
      (client.getThing as any) = jest.fn(() => client.createThing());
      (client.getUrl as any) = jest.fn(() => 'http://test-uri/');
      (client.getUrlAll as any) = jest.fn(() => [  ]);
      (client.setThing as any) = jest.fn(() => 'test-thing');
      (client.removeThing as any) = jest.fn(() => 'test-thing');
      (client.saveSolidDatasetAt as any) = jest.fn(async () => 'test-dataset');
      (client.addUrl as any) = jest.fn(() => 'test-url');
      (client.addStringNoLocale as any) = jest.fn(() => 'test-url');
      (client.addStringWithLocale as any) = jest.fn(() => 'test-url');
      (client.addInteger as any) = jest.fn(() => 'test-url');
      (client.addDecimal as any) = jest.fn(() => 'test-url');

      const objectWithoutSubject = {
        ...mockObject,
        subject: undefined,
        location: undefined,
        person: undefined,
        organization: undefined,
        event: undefined,
      };

      const result = await service.save(objectWithoutSubject);

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

    it('should call uploadImage when imageFile is set', async () => {

      (client.getSolidDataset as any) = jest.fn(async () => 'test-dataset');
      (client.getThing as any) = jest.fn(() => client.createThing());
      (client.getUrl as any) = jest.fn(() => 'http://test-uri/');
      (client.getUrlAll as any) = jest.fn(() => [ 'http://test-uri/' ]);
      (client.setThing as any) = jest.fn(() => 'test-thing');
      (client.removeThing as any) = jest.fn(() => 'test-thing');
      (client.saveSolidDatasetAt as any) = jest.fn(async () => 'test-dataset');
      (client.addUrl as any) = jest.fn(() => 'test-url');
      (client.addStringNoLocale as any) = jest.fn(() => 'test-url');
      (client.addStringWithLocale as any) = jest.fn(() => 'test-url');
      (client.addInteger as any) = jest.fn(() => 'test-url');
      (client.addDecimal as any) = jest.fn(() => 'test-url');

      const objectWithImageFile = {
        ...mockObject,
        imageFile: new File([ 'test-image' ], 'test-image.jpg'),
      };

      await service.save(objectWithImageFile);

      expect(service.uploadImage).toHaveBeenCalledTimes(1);

    });

  });

  describe('toThing()', () => {

    it('should error when object is null', () => {

      expect(() => CollectionObjectSolidStore.toThing(null)).toThrow('Argument object should be set');

    });

    it('should not add undefined properties to thing', () => {

      const mockObject2 = { uri: mockObject.uri } as CollectionObject;

      const { object: result } = CollectionObjectSolidStore.toThing(mockObject2);

      (client.addDecimal as any) = jest.fn((thing) => thing);
      (client.addStringNoLocale as any) = jest.fn((thing) => thing);

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

      (client.getUrl as any) = jest.fn(() => undefined);
      (client.getStringNoLocale as any) = jest.fn(() => undefined);
      (client.getUrlAll as any) = jest.fn(() => [ ]);
      (client.getStringWithLocale as any) = jest.fn(() => undefined);
      (client.asUrl as any) = jest.fn(() => undefined);

      const objectThing = client.createThing({ url: mockObject.uri });
      (client.getThing as any) = jest.fn(() => objectThing);

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

      (client.getUrl as any) = jest.fn((thing, uri) => {

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

      (client.getStringNoLocale as any) = jest.fn(() => 'test-string');
      (client.getUrlAll as any) = jest.fn(() => [ 'https://test.url/' ]);
      (client.getStringWithLocale as any) = jest.fn(() => 'test-string');
      (client.asUrl as any) = jest.fn(() => 'https://test.url/');

      const objectThing = client.createThing({ url: mockObject.uri });
      (client.getThing as any) = jest.fn(() => objectThing);

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

      expect(() => CollectionObjectSolidStore.getDigitalObjectUri(null as unknown as string)).toThrow();

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

    const termUri = 'https://test.url/';
    const termName = 'name';
    const termThing = client.createThing({ url: termUri });

    it.each([ null, undefined ])('should error when dataset is %s', (value) => {

      expect(() => CollectionObjectSolidStore.getTerm('uri', value as unknown as any)).toThrow('Argument dataset should be set');

    });

    it.each([ null, undefined ])('should error when uri is %s', (value) => {

      expect(() => CollectionObjectSolidStore.getTerm(value as unknown as string, client.createSolidDataset())).toThrow('Argument uri should be set');

    });

    it('should error when Thing not found in dataset', () => {

      (client.getThing as any) = jest.fn(() => undefined);

      expect(() => CollectionObjectSolidStore.getTerm('uri', client.createSolidDataset())).toThrow('No Thing found for uri');

    });

    it('should error when name not found in thing', async () => {

      (client.getStringNoLocale as any) = jest.fn(() => undefined);
      (client.getThing as any) = jest.fn(() => termThing);

      expect(() => CollectionObjectSolidStore.getTerm('uri', client.createSolidDataset())).toThrow('Could not find name in dataset');

    });

    it('should return correct Thing when present', () => {

      (client.getStringNoLocale as any) = jest.fn(() => termName);
      (client.getThing as any) = jest.fn(() => termThing);

      expect(CollectionObjectSolidStore.getTerm(termUri, client.createSolidDataset()))
        .toEqual({ uri: termUri, name: termName });

    });

  });

  describe('uploadImage()', () => {

    const imageUri = 'https://image.uri/image.png';
    const objectUri = 'https://object.uri/objects/object-1';
    const imageFile = new File([ 'test' ], 'image.png', { type: 'image/png' });

    beforeEach(() => {

      // reset mocked uploadImage
      service = new CollectionObjectSolidStore(solidService);

      (service.getSession as any) = jest.fn(() => ({
        info: {
          webId: 'https://example.com/profile/card#me',
        },
        fetch,
      }));

      (client.saveFileInContainer as any) = jest.fn(async (): Promise<WithResourceInfo> => ({
        internal_resourceInfo: {
          sourceIri: imageUri,
          isRawData: true,
          contentType: 'image/png',
        },
      }));

      service.setPublicAccess = jest.fn(async () => undefined);

    });

    it.each([ null, undefined ])('should error when objectUri is %s', async (value) => {

      await expect(() => service.uploadImage(imageFile, value as unknown as string)).rejects.toThrow('Argument objectUri should be set');

    });

    it.each([ null, undefined ])('should error when imageFile is %s', async (value) => {

      await expect(() => service.uploadImage(value as unknown as File, objectUri)).rejects.toThrow('Argument imageFile should be set');

    });

    it('should return image Uri when successful', async () => {

      const result = await service.uploadImage(imageFile, objectUri);

      expect(result).toEqual(imageUri);
      expect(client.saveFileInContainer).toHaveBeenCalledTimes(1);

      expect(client.saveFileInContainer).toHaveBeenCalledWith(
        expect.stringMatching(`https://object.uri/objects/`),
        imageFile,
        expect.objectContaining({ slug: expect.stringMatching(/^.*-image\.png$/), contentType: 'image/png' }),
      );

      expect(service.setPublicAccess).toHaveBeenCalledTimes(1);

    });

  });

  describe('sendMetadataUpdate', () => {

    beforeEach(() => {

      service.get = jest.fn(async () => mockObject);
      service.getInbox = jest.fn(async () =>'https://notification.uri/inbox/');

    });

    it('should return metadata updates notification URI when successful', async () => {

      fetchMock.mockOnce('created', {
        headers: {
          'Location': 'https://notification.uri/inbox/notif-id',
        },
      });

      // eslint-disable-next-line @typescript-eslint/dot-notation
      await expect(service['sendMetadataUpdate']('https://original.uri/', mockObject))
        .resolves.toEqual('https://notification.uri/inbox/notif-id');

    });

    it('should error when no Location header returned', async () => {

      fetchMock.mockOnce('created', {
        headers: { },
      });

      // eslint-disable-next-line @typescript-eslint/dot-notation
      await expect(service['sendMetadataUpdate']('https://original.uri/', mockObject))
        .rejects.toThrow('Error while sending metadata update notification');

    });

  });

  describe('getInbox', () => {

    it('should error when no collection Thing could be found', async () => {

      (client.getSolidDataset as any) = jest.fn(async () => 'test-dataset');
      (client.getThing as any) = jest.fn(() => undefined);

      await expect(service.getInbox(mockObject)).rejects.toThrow('Could not find collectionThing in dataset');

    });

    it('should error when no inbox URI could be found in collection', async () => {

      (client.getSolidDataset as any) = jest.fn(async () => 'test-dataset');
      (client.getThing as any) = jest.fn(() => 'test-thing');
      (client.asUrl as any) = jest.fn(() => 'https://collection.uri/');
      (client.getUrl as any) = jest.fn(() => undefined);

      await expect(service.getInbox(mockObject)).rejects.toThrow('could not find inbox for https://collection.uri/');

    });

    it('should return inbox URI when successful', async () => {

      (client.getSolidDataset as any) = jest.fn(async () => 'test-dataset');
      (client.getThing as any) = jest.fn(() => 'test-thing');
      (client.asUrl as any) = jest.fn(() => 'https://collection.uri/');
      (client.getUrl as any) = jest.fn(() => 'https://inbox.uri/');

      await expect(service.getInbox(mockObject)).resolves.toEqual('https://inbox.uri/');

    });

  });

  describe('createNotificationBody', () => {

    it('should set origin to solid-crs client id when not set', async () => {

      const args = {
        inbox: 'string',
        notificationId: 'string',
        type: 'string',
        summary: 'string',
        actor: 'string',
        target: 'string',
        updatedObject: 'string',
        originalObject: 'string',
      };

      // eslint-disable-next-line @typescript-eslint/dot-notation
      const result = service['createNotificationBody'](args);

      expect(result).toEqual(`
@prefix as: <https://www.w3.org/ns/activitystreams#> .

<${args.inbox}${args.notificationId}>
  a <${args.type}> ;
  as:summary "${args.summary}" ;  
  as:actor <${args.actor}> ;
  as:target <${args.target}> ;
  as:object <${args.originalObject}> ;
  as:context <${args.updatedObject}> ;
  as:origin <https://webid.netwerkdigitaalerfgoed.nl/collectiebeheersysteem> .
`);

    });

    it('should return valid notification body', async () => {

      const args = {
        inbox: 'string',
        notificationId: 'string',
        type: 'string',
        summary: 'string',
        actor: 'string',
        target: 'string',
        updatedObject: 'string',
        originalObject: 'string',
        origin: 'string',
      };

      // eslint-disable-next-line @typescript-eslint/dot-notation
      const result = service['createNotificationBody'](args);

      expect(result).toEqual(`
@prefix as: <https://www.w3.org/ns/activitystreams#> .

<${args.inbox}${args.notificationId}>
  a <${args.type}> ;
  as:summary "${args.summary}" ;  
  as:actor <${args.actor}> ;
  as:target <${args.target}> ;
  as:object <${args.originalObject}> ;
  as:context <${args.updatedObject}> ;
  as:origin <${args.origin}> .
`);

    });

  });

});
