import { ArgumentError } from '../errors/argument-error';
import { Collection } from './collection';
import { CollectionMemoryStore } from './collection-memory-store';

describe('CollectionMemoryStore', () => {

  const resources: Collection[] = [
    {
      uri: 'collection-uri-1',
      name: 'Collection 1',
      description: 'This is collection 1',
      objectsUri: '',
      distribution: '',
      inbox: '',
      publisher: '',
    },
    {
      uri: 'collection-uri-2',
      name: 'Collection 2 testing',
      description: 'This is collection 2 testing',
      objectsUri: '',
      distribution: '',
      inbox: '',
      publisher: '',
    },
    {
      uri: 'collection-uri-3',
      name: 'Collection 3 testing nachos',
      description: 'This is collection 3 testing nachos',
      objectsUri: '',
      distribution: '',
      inbox: '',
      publisher: '',
    },
  ];

  let service: CollectionMemoryStore;

  beforeEach(async () => {

    service = new CollectionMemoryStore(resources);

  });

  it('should be correctly instantiated', () => {

    expect(service).toBeTruthy();

  });

  describe('all', () => {

    it('should return all resources', async () => {

      expect(service.all()).resolves.toEqual(resources);

    });

  });

  describe('search', () => {

    it('should error when searchTerm is empty', async () => {

      await expect(service.search('', resources)).rejects.toThrow(ArgumentError);

    });

    it('should return the correct collections', async () => {

      await expect(service.search('testing', resources)).resolves.toEqual([ resources[1], resources[2] ]);

    });

    it('should return the correct collections', async () => {

      await expect(service.search('nacho', resources)).resolves.toEqual([ resources[2] ]);

    });

    it('should error when searchTerm is undefined', async () => {

      await expect(service.search(undefined as unknown as string, resources)).rejects.toThrow(ArgumentError);

    });

    it('should error when collections is undefined', async () => {

      await expect(service.search('test', undefined as unknown as Collection[])).rejects.toThrow(ArgumentError);

    });

  });

  describe('getInstanceForClass', () => {

    it('should error when webId is undefined', async () => {

      await expect(service.getInstanceForClass('test', undefined as unknown as string)).rejects.toThrow(ArgumentError);

    });

    it('should error when forClass is undefined', async () => {

      await expect(service.getInstanceForClass(undefined as unknown as string, 'test')).rejects.toThrow(ArgumentError);

    });

    it('should return a string', async () => {

      const result = await service.getInstanceForClass('test', 'test');
      expect(result).toBeTruthy();
      expect(typeof result).toEqual('string');

    });

  });

});
