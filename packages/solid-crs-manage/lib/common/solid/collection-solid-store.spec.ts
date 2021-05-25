import * as client from '@netwerk-digitaal-erfgoed/solid-crs-client';
import { Collection } from '@netwerk-digitaal-erfgoed/solid-crs-core';
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

    it('should error when no webid could be found', async () => {

      client.getDefaultSession = jest.fn(() => undefined);

      await expect(service.all()).rejects.toThrow('Argument WebID should be set');

    });

    it('should error when no type registration could be found', async () => {

      client.getDefaultSession = jest.fn(() => mockSession);
      service.getInstanceForClass = jest.fn(async () => undefined);
      service.saveInstanceForClass = jest.fn(async () => undefined);

      await expect(service.all()).rejects.toThrow('Could not retrieve type registration');

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

    it('should create new catalog when none was found', async (done) => {

      client.getDefaultSession = jest.fn(() => mockSession);
      service.getInstanceForClass = jest.fn(async () => 'test-instance');
      service.get = jest.fn(async () => mockCollection);
      client.getSolidDataset = jest.fn(async () => { throw new Error(); });
      client.getThing = jest.fn(() => 'test-thing');
      client.getUrlAll = jest.fn(() => [ 'test-thing ' ]);

      service.createCatalog = jest.fn(async () => {

        done();

      });

      await service.all();

    });

  });

  describe('delete()', () => {

    it.each([ null, undefined ])('should error when collection is %s', async (value) => {

      await expect(service.delete(value)).rejects.toThrow('Argument collection should be set');

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

      expect(service.delete(mockCollection)).resolves.toEqual(mockCollection);

    });

  });

  describe('save()', () => {

    it.each([ null, undefined ])('should error when collection is %s', async (value) => {

      await expect(service.save(value)).rejects.toThrow('Argument collection should be set');

    });

    it('should return collection when saved', async () => {

      service.getInstanceForClass = jest.fn(() => 'https://test-uri/');
      client.getSolidDataset = jest.fn(async () => 'test-dataset');
      client.getThing = jest.fn(() => 'test-thing');
      client.setThing = jest.fn(() => 'test-dataset');
      client.addUrl = jest.fn(() => 'test-thing');
      client.createThing = jest.fn(() => 'test-thing');
      client.addStringWithLocale = jest.fn(() => 'test-thing');
      client.saveSolidDatasetAt = jest.fn(async () => 'test-dataset');
      client.overwriteFile = jest.fn(async () => 'test-file');
      client.fetch = jest.fn(async () => ({ ok: true }));

      await expect(service.save(mockCollection)).resolves.toEqual(mockCollection);

    });

    it('should return collection with new uri when saved', async () => {

      delete mockCollection.uri;

      service.getInstanceForClass = jest.fn(() => 'https://test-uri/');
      client.getSolidDataset = jest.fn(async () => 'test-dataset');
      client.getThing = jest.fn(() => 'test-thing');
      client.getUrl = jest.fn(() => 'test-url');
      client.setThing = jest.fn(() => 'test-dataset');
      client.addUrl = jest.fn(() => 'test-thing');
      client.createThing = jest.fn(() => 'test-thing');
      client.addStringWithLocale = jest.fn(() => 'test-thing');
      client.saveSolidDatasetAt = jest.fn(async () => 'test-dataset');
      client.fetch = jest.fn(async () => ({ ok: true }));

      const result = await service.save(mockCollection);

      expect(result).toEqual(expect.objectContaining({ ...mockCollection }));
      expect(result.uri).toBeTruthy();

    });

    it('should return collection with new objectsUri when saved', async () => {

      delete mockCollection.objectsUri;

      service.getInstanceForClass = jest.fn(() => 'https://test-uri/');
      client.getSolidDataset = jest.fn(async () => 'test-dataset');
      client.getThing = jest.fn(() => 'test-thing');
      client.setThing = jest.fn(() => 'test-dataset');
      client.getUrl = jest.fn(() => 'https://test-uri/');
      client.addUrl = jest.fn(() => 'test-thing');
      client.createThing = jest.fn(() => 'test-thing');
      client.addStringWithLocale = jest.fn(() => 'test-thing');
      client.saveSolidDatasetAt = jest.fn(async () => 'test-dataset');
      client.fetch = jest.fn(async () => ({ ok: true }));

      const result = await service.save(mockCollection);

      expect(result).toEqual(expect.objectContaining({ ...mockCollection }));
      expect(result.objectsUri).toBeTruthy();

    });

    it('should return collection with new distribution when saved', async () => {

      delete mockCollection.distribution;

      service.getInstanceForClass = jest.fn(() => 'https://test-uri/');
      client.getSolidDataset = jest.fn(async () => 'test-dataset');
      client.getThing = jest.fn(() => 'test-thing');
      client.setThing = jest.fn(() => 'test-dataset');
      client.getUrl = jest.fn(() => 'test-url');
      client.addUrl = jest.fn(() => 'test-thing');
      client.createThing = jest.fn(() => 'test-thing');
      client.addStringWithLocale = jest.fn(() => 'test-thing');
      client.saveSolidDatasetAt = jest.fn(async () => 'test-dataset');
      client.fetch = jest.fn(async () => ({ ok: true }));

      const result = await service.save(mockCollection);

      expect(result).toEqual(expect.objectContaining({ ...mockCollection }));
      expect(result.distribution).toBeTruthy();

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

  describe('createCatalog()', () => {

    it('should call overwriteFile', async (done) => {

      client.getDefaultSession = jest.fn(() => mockSession);

      client.getSolidDataset = jest.fn(async () => 'test-dataset');
      client.getThing = jest.fn(() => 'test-thing');
      client.getStringWithLocale = jest.fn(() => 'test-string');
      client.getStringNoLocale = jest.fn(() => 'test-string');

      client.overwriteFile = jest.fn(() => done());
      await service.createCatalog('test-uri');

    });

    it('should use schema:name by default', async () => {

      client.getDefaultSession = jest.fn(() => mockSession);

      client.getSolidDataset = jest.fn(async () => 'test-dataset');
      client.getThing = jest.fn(() => 'test-thing');
      client.getStringWithLocale = jest.fn(() => 'test-string');
      client.getStringNoLocale = jest.fn(() => 'test-string');
      client.overwriteFile = jest.fn(() => 'test-file');

      await service.createCatalog('test-uri');
      expect(client.getStringWithLocale).toHaveBeenCalledTimes(1);
      expect(client.getStringNoLocale).not.toHaveBeenCalled();

    });

    it('should use foaf:name when schema:name was not found', async (done) => {

      client.getDefaultSession = jest.fn(() => mockSession);

      client.getSolidDataset = jest.fn(async () => 'test-dataset');
      client.getThing = jest.fn(() => 'test-thing');
      client.getStringWithLocale = jest.fn(() => null);
      client.getStringNoLocale = jest.fn(() => done());
      client.overwriteFile = jest.fn(() => 'test-file');

      await service.createCatalog('test-uri');

    });

  });

});
