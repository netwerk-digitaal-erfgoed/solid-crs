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
    },
    {
      uri: 'collection-uri-2',
      name: 'Collection 2 testing',
      description: 'This is collection 2 testing',
      objectsUri: '',
      distribution: '',
    },
    {
      uri: 'collection-uri-3',
      name: 'Collection 3 testing nachos',
      description: 'This is collection 3 testing nachos',
      objectsUri: '',
      distribution: '',
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

      await expect(service.search('')).rejects.toThrow(ArgumentError);

    });

    it('should return the correct collections', async () => {

      await expect(service.search('testing')).resolves.toEqual([ resources[1], resources[2] ]);

    });

    it('should return the correct collections', async () => {

      await expect(service.search('nacho')).resolves.toEqual([ resources[2] ]);

    });

    it('should error when searchTerm is undefined', async () => {

      await expect(service.search(undefined)).rejects.toThrow(ArgumentError);

    });

  });

});
