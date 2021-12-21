/* eslint-disable @typescript-eslint/no-explicit-any */
import * as client from '@netwerk-digitaal-erfgoed/solid-crs-client';
import { Collection } from '../collections/collection';
import { ArgumentError } from '../errors/argument-error';
import { CollectionSolidStore } from './collection-solid-store';

describe('CollectionSolidStore', () => {

  let service: CollectionSolidStore;

  const mockSession = {
    info: {
      webId: 'test-webid',
    },
  };

  let mockCollection;

  const solidService = {
    getDefaultSession: jest.fn(() => ({
      info: {
        webId: 'https://example.com/profile/card#me',
      },
      fetch,
    })),
  } as any;

  beforeEach(() => {

    service = new CollectionSolidStore(solidService);

    (service.getSession as any) = jest.fn(() => ({
      info: {
        webId: 'https://example.com/profile/card#me',
      },
      fetch,
    }));

    jest.clearAllMocks();

    mockCollection = {
      uri: 'https://test.uri/',
      name: 'test-name',
      description: 'test-description',
      objectsUri: 'https://test.uri/',
      distribution: 'https://test.uri/',
    } as Collection;

  });

  it('should instantiate', () => {

    expect(service).toBeTruthy();

  });

  describe('all()', () => {

    it('should error when no webid could be found', async () => {

      (solidService.getDefaultSession as any) = jest.fn(() => undefined);

      await expect(service.all()).rejects.toThrow('Argument WebID should be set');

    });

    it('should error when no type registration could be found', async () => {

      (solidService.getDefaultSession as any) = jest.fn(() => mockSession);
      (service.getInstanceForClass as any) = jest.fn(async () => undefined);
      (service.saveInstanceForClass as any) = jest.fn(async () => undefined);

      await expect(service.all()).rejects.toThrow('Could not retrieve type registration');

    });

    it('should return empty list when no collections in catalog', async () => {

      (service.getInstanceForClass as any) = jest.fn(async () => 'test-instance');
      (solidService.getDefaultSession as any) = jest.fn(() => mockSession);
      (client.getSolidDataset as any) = jest.fn(async () => 'test-dataset');
      (client.getThing as any) = jest.fn(() => 'test-thing');
      (client.getUrlAll as any) = jest.fn(() => [ ]);

      await expect(service.all()).resolves.toEqual([]);

    });

    it('should return empty list when no collections in catalog', async () => {

      (service.getInstanceForClass as any) = jest.fn(async () => 'test-instance');
      (service.get as any) = jest.fn(async () => mockCollection);
      (solidService.getDefaultSession as any) = jest.fn(() => mockSession);
      (client.getSolidDataset as any) = jest.fn(async () => 'test-dataset');
      (client.getThing as any) = jest.fn(() => 'test-thing');
      (client.getUrlAll as any) = jest.fn(() => [ 'test-thing ' ]);

      await expect(service.all()).resolves.toEqual([ mockCollection ]);

    });

    it('should create new catalog when none was found', async (done) => {

      (solidService.getDefaultSession as any) = jest.fn(() => mockSession);
      (service.getInstanceForClass as any) = jest.fn(async () => 'test-instance');
      (service.get as any) = jest.fn(async () => mockCollection);
      (client.getSolidDataset as any) = jest.fn(async () => { throw new Error(); });
      (client.getThing as any) = jest.fn(() => 'test-thing');
      (client.getUrlAll as any) = jest.fn(() => [ 'test-thing ' ]);

      (service.createCatalog as any) = jest.fn(async () => {

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

      (client.getSolidDataset as any) = jest.fn(async () => 'test-dataset');
      (client.getThing as any) = jest.fn(() => 'test-thing');
      (client.removeUrl as any) = jest.fn(() => 'test-thing');
      (client.setThing as any) = jest.fn(() => 'test-dataset');
      (client.removeThing as any) = jest.fn(() => 'test-thing');
      (client.getUrl as any) = jest.fn(() => 'https://test.uri/');
      (client.saveSolidDatasetAt as any) = jest.fn(async () => 'test-dataset');
      (client.deleteFile as any) = jest.fn(async () => 'test-file');

      expect(service.delete(mockCollection)).resolves.toEqual(mockCollection);

    });

  });

  describe('save()', () => {

    beforeEach(() => {

      (service.setPublicAccess as any) = jest.fn(async() => true);

    });

    it.each([ null, undefined ])('should error when collection is %s', async (value) => {

      await expect(service.save(value)).rejects.toThrow('Argument collection should be set');

    });

    it('should return collection when saved', async () => {

      (service.getInstanceForClass as any) = jest.fn(() => 'https://test.uri/');
      (client.getSolidDataset as any) = jest.fn(async () => 'test-dataset');
      (client.getThing as any) = jest.fn(() => 'test-thing');
      (client.setThing as any) = jest.fn(() => 'test-dataset');
      (client.addUrl as any) = jest.fn(() => 'test-thing');
      (client.createThing as any) = jest.fn(() => 'test-thing');
      (client.addStringNoLocale as any) = jest.fn(() => 'test-thing');
      (client.addStringWithLocale as any) = jest.fn(() => 'test-thing');
      (client.saveSolidDatasetAt as any) = jest.fn(async () => 'test-dataset');
      (client.overwriteFile as any) = jest.fn(async () => 'test-file');

      await expect(service.save(mockCollection)).resolves.toEqual(mockCollection);

    });

    it('should return collection with new uri when saved', async () => {

      delete mockCollection.uri;

      (service.getInstanceForClass as any) = jest.fn(() => 'https://test.uri/');
      (client.getSolidDataset as any) = jest.fn(async () => 'test-dataset');
      (client.getThing as any) = jest.fn(() => 'test-thing');
      (client.getUrl as any) = jest.fn(() => 'https://test.uri/');
      (client.setThing as any) = jest.fn(() => 'test-dataset');
      (client.addUrl as any) = jest.fn(() => 'test-thing');
      (client.createThing as any) = jest.fn(() => 'test-thing');
      (client.addStringWithLocale as any) = jest.fn(() => 'test-thing');
      (client.addStringNoLocale as any) = jest.fn(() => 'test-thing');
      (client.saveSolidDatasetAt as any) = jest.fn(async () => 'test-dataset');

      const result = await service.save(mockCollection);

      expect(result).toEqual(expect.objectContaining({ ...mockCollection }));
      expect(result.uri).toBeTruthy();

    });

    it('should return collection with new objectsUri when saved', async () => {

      delete mockCollection.objectsUri;

      (service.getInstanceForClass as any) = jest.fn(() => 'https://test.uri/');
      (client.getSolidDataset as any) = jest.fn(async () => 'test-dataset');
      (client.getThing as any) = jest.fn(() => 'test-thing');
      (client.setThing as any) = jest.fn(() => 'test-dataset');
      (client.getUrl as any) = jest.fn(() => 'https://test.uri/');
      (client.addUrl as any) = jest.fn(() => 'test-thing');
      (client.createThing as any) = jest.fn(() => 'test-thing');
      (client.addStringWithLocale as any) = jest.fn(() => 'test-thing');
      (client.addStringNoLocale as any) = jest.fn(() => 'test-thing');
      (client.saveSolidDatasetAt as any) = jest.fn(async () => 'test-dataset');

      const result = await service.save(mockCollection);

      expect(result).toEqual(expect.objectContaining({ ...mockCollection }));
      expect(result.objectsUri).toBeTruthy();

    });

    it('should return collection with new distribution when saved', async () => {

      delete mockCollection.distribution;

      (service.getInstanceForClass as any) = jest.fn(() => 'https://test.uri/');
      (client.getSolidDataset as any) = jest.fn(async () => 'test-dataset');
      (client.getThing as any) = jest.fn(() => 'test-thing');
      (client.setThing as any) = jest.fn(() => 'test-dataset');
      (client.getUrl as any) = jest.fn(() => 'https://test.uri/');
      (client.addUrl as any) = jest.fn(() => 'test-thing');
      (client.createThing as any) = jest.fn(() => 'test-thing');
      (client.addStringWithLocale as any) = jest.fn(() => 'test-thing');
      (client.addStringNoLocale as any) = jest.fn(() => 'test-thing');
      (client.saveSolidDatasetAt as any) = jest.fn(async () => 'test-dataset');
      const result = await service.save(mockCollection);

      expect(result).toEqual(expect.objectContaining({ ...mockCollection }));
      expect(result.distribution).toBeTruthy();

    });

    it('should create new objects file if it doesnt exist', async () => {

      (service.getInstanceForClass as any) = jest.fn(() => 'https://test.uri/');
      (client.getSolidDataset as any) = jest.fn(async () => 'test-dataset');
      (client.getThing as any) = jest.fn(() => 'test-thing');
      (client.setThing as any) = jest.fn(() => 'test-dataset');
      (client.addUrl as any) = jest.fn(() => 'test-thing');
      (client.createThing as any) = jest.fn(() => 'test-thing');
      (client.addStringWithLocale as any) = jest.fn(() => 'test-thing');
      (client.addStringNoLocale as any) = jest.fn(() => 'test-thing');
      (client.saveSolidDatasetAt as any) = jest.fn(async () => 'test-dataset');
      (client.overwriteFile as any) = jest.fn(async () => 'test-file');

      (service.getSession as any) = jest.fn(() => ({
        info: {
          webId: 'https://example.com/profile/card#me',
        },
        fetch: jest.fn(async () => ({ ok: false })),
      }));

      const result = await service.save(mockCollection);
      expect(result).toEqual(mockCollection);
      expect(client.overwriteFile).toHaveBeenCalledTimes(1);

    });

  });

  describe('get()', () => {

    it.each([ null, undefined ])('should error when uri is %s', async (value) => {

      (client.getSolidDataset as any) = jest.fn(async () => 'test-dataset');
      (client.getThing as any) = jest.fn(() => null);

      await expect(service.get(value)).rejects.toThrow('Argument uri should be set');

    });

    it('should return null when no collection was found', async () => {

      (client.getSolidDataset as any) = jest.fn(async () => 'test-dataset');
      (client.getThing as any) = jest.fn(() => null);

      await expect(service.get('test.uri')).rejects.toThrow('Could not find collectionThing in dataset');

    });

    it('should return collection with same uri', async () => {

      (client.getSolidDataset as any) = jest.fn(async () => 'test-dataset');
      (client.getThing as any) = jest.fn(() => 'test-thing');
      (client.getUrl as any) = jest.fn(() => 'https://test.uri/');
      (client.getStringWithLocale as any) = jest.fn(() => 'test-string');

      await expect(service.get('test.uri')).resolves.toEqual({
        uri: 'test.uri',
        name: 'test-string',
        description: 'test-string',
        objectsUri: 'https://test.uri/',
        distribution: 'https://test.uri/',
      });

    });

  });

  describe('createCatalog()', () => {

    it('should error when webId could be found', async () => {

      (solidService.getDefaultSession as any) = jest.fn(() => undefined);

      await expect(service.createCatalog('test.uri')).rejects.toThrow('Not logged in');

    });

    it('should call overwriteFile', async (done) => {

      (solidService.getDefaultSession as any) = jest.fn(() => mockSession);

      (client.getSolidDataset as any) = jest.fn(async () => 'test-dataset');
      (client.getThing as any) = jest.fn(() => 'test-thing');
      (client.getStringWithLocale as any) = jest.fn(() => 'test-string');
      (client.getStringNoLocale as any) = jest.fn(() => 'test-string');

      (client.overwriteFile as any) = jest.fn(() => done());
      await service.createCatalog('test.uri');

    });

    it('should use schema:name by default', async () => {

      (solidService.getDefaultSession as any) = jest.fn(() => mockSession);

      (client.getSolidDataset as any) = jest.fn(async () => 'test-dataset');
      (client.getThing as any) = jest.fn(() => 'test-thing');
      (client.getStringWithLocale as any) = jest.fn(() => 'test-string');
      (client.getStringNoLocale as any) = jest.fn(() => 'test-string');
      (client.overwriteFile as any) = jest.fn(() => 'test-file');

      await service.createCatalog('test.uri');
      expect(client.getStringWithLocale).toHaveBeenCalledTimes(1);
      expect(client.getStringNoLocale).not.toHaveBeenCalled();

    });

    it('should use foaf:name when schema:name was not found', async (done) => {

      (solidService.getDefaultSession as any) = jest.fn(() => mockSession);

      (client.getSolidDataset as any) = jest.fn(async () => 'test-dataset');
      (client.getThing as any) = jest.fn(() => 'test-thing');
      (client.getStringWithLocale as any) = jest.fn(() => null);
      (client.getStringNoLocale as any) = jest.fn(() => done());
      (client.overwriteFile as any) = jest.fn(() => 'test-file');

      await service.createCatalog('test.uri');

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

});
