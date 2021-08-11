import * as client from '@netwerk-digitaal-erfgoed/solid-crs-client';
import { ArgumentError, Collection, NotImplementedError } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { CollectionSolidStore } from './collection-solid-store';

describe('CollectionSolidStore', () => {

  let service: CollectionSolidStore;

  const mockSession = {
    info: {
      webId: 'test-webid',
    },
  };

  let mockCollection;

  beforeEach(() => {

    service = new CollectionSolidStore();
    service.webId = mockSession.info.webId;

    jest.clearAllMocks();

    mockCollection = {
      uri: 'test-uri',
      name: 'test-name',
      description: 'test-description',
      objectsUri: 'test-url',
      distribution: 'test-url',
    } as Collection;

  });

  it('should instantiate', () => {

    expect(service).toBeTruthy();

  });

  describe('all()', () => {

    it('should error when no type registration could be found', async () => {

      service.webId = undefined;

      await expect(service.all()).rejects.toThrow('Argument WebID should be set');

    });

    it('should error when no type registration could be found', async () => {

      client.getDefaultSession = jest.fn(() => mockSession);
      service.getInstanceForClass = jest.fn(async () => undefined);
      service.saveInstanceForClass = jest.fn(async () => undefined);

      await expect(service.all()).rejects.toThrow('Could not retrieve type registration');

    });

    it('should error when no catalog could be found', async () => {

      client.getDefaultSession = jest.fn(() => mockSession);
      service.getInstanceForClass = jest.fn(async () => 'test-uri');
      client.getSolidDataset = jest.fn().mockRejectedValueOnce('err');
      await expect(service.all()).rejects.toThrow('Could not retrieve catalog');

    });

    it('should return empty list when no collections in catalog', async () => {

      service.getInstanceForClass = jest.fn(async () => 'test-instance');
      client.getDefaultSession = jest.fn(() => mockSession);
      client.getSolidDataset = jest.fn(async () => 'test-dataset');
      client.getThing = jest.fn(() => 'test-thing');
      client.getUrlAll = jest.fn(() => [ ]);

      await expect(service.all()).resolves.toEqual([]);

    });

    it('should return empty list when no collections in catalog', async () => {

      service.getInstanceForClass = jest.fn(async () => 'test-instance');
      service.get = jest.fn(async () => mockCollection);
      client.getDefaultSession = jest.fn(() => mockSession);
      client.getSolidDataset = jest.fn(async () => 'test-dataset');
      client.getThing = jest.fn(() => 'test-thing');
      client.getUrlAll = jest.fn(() => [ 'test-thing ' ]);

      await expect(service.all()).resolves.toEqual([ mockCollection ]);

    });

  });

  describe('get()', () => {

    it.each([ null, undefined ])('should error when uri is %s', async (value) => {

      client.getSolidDataset = jest.fn(async () => 'test-dataset');
      client.getThing = jest.fn(() => null);

      await expect(service.get(value)).rejects.toThrow('Argument uri should be set');

    });

    it('should return null when no collection was found', async () => {

      client.getSolidDataset = jest.fn(async () => 'test-dataset');
      client.getThing = jest.fn(() => null);

      await expect(service.get('test-uri')).resolves.toEqual(null);

    });

    it('should return collection with same uri', async () => {

      client.getSolidDataset = jest.fn(async () => 'test-dataset');
      client.getThing = jest.fn(() => 'test-thing');
      client.getUrl = jest.fn(() => 'test-url');
      client.getStringWithLocale = jest.fn(() => 'test-string');

      await expect(service.get('test-uri')).resolves.toEqual({
        uri: 'test-uri',
        name: 'test-string',
        description: 'test-string',
        objectsUri: 'test-url',
        distribution: 'test-url',
      });

    });

  });

  describe('search()', () => {

    it.each([ null, undefined ])('should error when collections is %s', async (value) => {

      await expect(service.search('searchterm', value)).rejects.toThrow(ArgumentError);

    });

    it.each([ null, undefined ])('should error when searchTerm is %s', async (value) => {

      await expect(service.search(value, [ mockCollection ])).rejects.toThrow(ArgumentError);

    });

    it('should return filtered list', async () => {

      const collections = [ mockCollection, mockCollection, { ...mockCollection, name: undefined } ];

      const result = await service.search(mockCollection.name, collections);
      expect(result).toBeTruthy();
      expect(result.length).toEqual(2);

    });

  });

  describe('delete', () => {

    it('should not be implemented', async () => {

      await expect(() => service.delete(undefined)).rejects.toThrow(NotImplementedError);

    });

  });

  describe('save', () => {

    it('should not be implemented', async () => {

      await expect(() => service.save(undefined)).rejects.toThrow(NotImplementedError);

    });

  });

});
