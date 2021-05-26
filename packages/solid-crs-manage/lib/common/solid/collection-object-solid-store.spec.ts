import * as client from '@netwerk-digitaal-erfgoed/solid-crs-client';
import { getStringNoLocale, getStringWithLocale, getUrl } from '@netwerk-digitaal-erfgoed/solid-crs-client';
import { Collection, CollectionObject, fulltextMatch } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { CollectionObjectSolidStore } from './collection-object-solid-store';

describe('CollectionObjectSolidStore', () => {

  let service: CollectionObjectSolidStore;

  let mockCollection: Collection;
  let mockObject: CollectionObject;

  beforeEach(() => {

    service = new CollectionObjectSolidStore();

    jest.resetAllMocks();

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
      client.getSolidDataset = jest.fn(async () => 'test-dataset');
      client.getThingAll = jest.fn(() => [ objectThing ]);

      const result = await service.getObjectsForCollection(mockCollection);

      expect(result.length).toBeTruthy();

      expect(result[0]).toEqual(expect.objectContaining({
        uri: mockObject.uri,
        collection: mockCollection.uri,
      }));

    });

  });

  describe('get()', () => {

    it.each([ null, undefined ])('should error when uri is %s', async (value) => {

      await expect(service.get(value)).rejects.toThrow('Argument uri should be set');

    });

    it('should return collection object', async () => {

      client.getSolidDataset = jest.fn(async () => 'test-dataset');
      client.getThing = jest.fn(() =>  'test-thing');
      client.getUrl = jest.fn(() => 'test-url');
      client.getStringWithLocale = jest.fn(() => 'test-string');

      await expect(service.get('test-url')).resolves.toEqual(
        expect.objectContaining({
          uri: 'test-url',
          name: 'test-string',
          description: 'test-string',
        }),
      );

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
      client.getThing = jest.fn(() => 'test-thing');
      client.removeUrl = jest.fn(() => 'test-thing');
      client.setThing = jest.fn(() => 'test-dataset');
      client.removeThing = jest.fn(() => 'test-thing');
      client.getUrl = jest.fn(() => 'test-url');
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
      client.getThing = jest.fn(() =>  'test-thing');
      client.getUrl = jest.fn(() => 'test-url');
      client.setThing = jest.fn(() => 'test-thing');
      client.saveSolidDatasetAt = jest.fn(async () => 'test-dataset');

      await expect(service.save(mockObject)).resolves.toEqual(mockObject);

    });

    it('should return object with new uri when it was not set', async () => {

      delete mockObject.uri;

      client.getSolidDataset = jest.fn(async () => 'test-dataset');
      client.getThing = jest.fn(() =>  'test-thing');
      client.getUrl = jest.fn(() => 'http://test-url/');
      client.setThing = jest.fn(() => 'test-thing');
      client.saveSolidDatasetAt = jest.fn(async () => 'test-dataset');

      const result = await service.save(mockObject);

      expect(result).toEqual(expect.objectContaining({ ...mockObject }));
      expect(result.uri).toBeTruthy();

    });

  });

  describe('toThing()', () => {

    it('should error when object is null', () => {

      expect(() => CollectionObjectSolidStore.toThing(null)).toThrow('Argument object should be set');

    });

    it('should not add undefined properties to thing', () => {

      const mockObject2 = { uri: mockObject.uri } as CollectionObject;

      const result = CollectionObjectSolidStore.toThing(mockObject2);

      expect(getStringNoLocale(result, 'http://schema.org/dateModified')).toBeFalsy();
      expect(getUrl(result, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type')).toBeFalsy();
      expect(getUrl(result, 'http://schema.org/additionalType')).toBeFalsy();
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
      expect(getStringNoLocale(result, 'http://schema.org/height')).toBeFalsy();
      expect(getStringNoLocale(result, 'http://schema.org/width')).toBeFalsy();
      expect(getStringNoLocale(result, 'http://schema.org/depth')).toBeFalsy();
      expect(getStringNoLocale(result, 'http://schema.org/weight')).toBeFalsy();
      expect(getUrl(result, 'http://schema.org/image')).toBeFalsy();
      expect(getUrl(result, 'http://schema.org/mainEntityOfPage')).toBeFalsy();

    });

    it('should convert object properties to thing', () => {

      const mockObject2 = {
        ...mockObject,
        updated: 'test',
        type: 'http://test.url/',
        additionalType: 'http://test.url/',
        identifier: 'test',
        name: 'test',
        description: 'test',
        collection: 'http://test.url/',
        maintainer: 'http://test.url/',
        creator: 'http://test.url/',
        locationCreated: 'http://test.url/',
        material: 'http://test.url/',
        dateCreated: 'test',
        subject: 'subject',
        location: 'location',
        person: 'person',
        organization: 'organization',
        event: 'event',
        height: 0,
        width: 0,
        depth: 0,
        weight: 0,
        image: 'http://test.url/',
        mainEntityOfPage: 'http://test.url',
      } as CollectionObject;

      const result = CollectionObjectSolidStore.toThing(mockObject2);

      expect(result).toBeTruthy();

    });

  });

  describe('fromThing()', () => {

    it('should error when object is null', () => {

      expect(() => CollectionObjectSolidStore.fromThing(null)).toThrow();

    });

    it('should set properties to undefined when not in Thing', () => {

      client.getUrl = jest.fn(() => undefined);
      client.getStringNoLocale = jest.fn(() => undefined);
      client.getStringWithLocale = jest.fn(() => undefined);

      const result = CollectionObjectSolidStore.fromThing(client.createThing({ url: mockObject.uri }));

      expect(result.updated).toEqual(undefined);
      expect(result.type).toEqual(undefined);
      expect(result.additionalType).toEqual(undefined);
      expect(result.identifier).toEqual(undefined);
      expect(result.name).toEqual(undefined);
      expect(result.description).toEqual(undefined);
      expect(result.collection).toEqual(undefined);
      expect(result.maintainer).toEqual(undefined);
      expect(result.creator).toEqual(undefined);
      expect(result.locationCreated).toEqual(undefined);
      expect(result.material).toEqual(undefined);
      expect(result.dateCreated).toEqual(undefined);
      expect(result.image).toEqual(undefined);
      expect(result.mainEntityOfPage).toEqual(undefined);
      expect(result.subject).toEqual(undefined);

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

});
