import { ArgumentError } from '../errors/argument-error';
import { Collection } from './collection';
import { CollectionObject } from './collection-object';
import { CollectionObjectMemoryStore } from './collection-object-memory-store';

describe('CollectionObjectMemoryStore', () => {

  const collection1 = {
    uri: 'collection-uri-1',
    name: 'Collection 1',
    description: 'This is collection 1',
    objectsUri: 'objects-uri',
  } as Collection;

  const resources: CollectionObject[] = [
    {
      uri: 'object-uri-1',
      name: 'Object 1',
      description: 'This is object 1 one',
      image: null,
      subject: null,
      type: null,
      updated: 0,
      collection: 'collection-uri-1',
    },
    {
      uri: 'object-uri-2',
      name: 'Object 2',
      description: 'This is object 2 two',
      image: null,
      subject: null,
      type: null,
      updated: 0,
      collection: 'collection-uri-1',
    },
    {
      uri: 'object-uri-3',
      name: 'Object 3',
      description: 'This is object 3 three',
      image: null,
      subject: null,
      type: null,
      updated: 0,
      collection: 'collection-uri-2',
    },
  ];

  let service: CollectionObjectMemoryStore;

  beforeEach(async () => {

    service = new CollectionObjectMemoryStore(resources);

  });

  it('should be correctly instantiated', () => {

    expect(service).toBeTruthy();

  });

  describe('all', () => {

    it('should return all resources', async () => {

      expect(service.all()).resolves.toEqual(resources);

    });

  });

  describe('getObjectsForCollection', () => {

    it('should return all resources in collection', () => {

      expect(service.getObjectsForCollection(collection1)).resolves.toEqual([ {
        uri: 'object-uri-1',
        name: 'Object 1',
        description: 'This is object 1',
        image: null,
        subject: null,
        type: null,
        updated: 0,
        collection: 'collection-uri-1',
      },
      {
        uri: 'object-uri-2',
        name: 'Object 2',
        description: 'This is object 2',
        image: null,
        subject: null,
        type: null,
        updated: 0,
        collection: 'collection-uri-1',
      } ]);

    });

    it('should throw error when collection is null', () => {

      expect(service.getObjectsForCollection(null)).rejects.toThrow(ArgumentError);

    });

    it('should throw error when resources is null', () => {

      service = new CollectionObjectMemoryStore(null);
      expect(service.getObjectsForCollection(collection1)).rejects.toThrow(ArgumentError);

    });

  });

  describe('search', () => {

    it('should error when searchTerm is empty', async () => {

      await expect(service.search('', resources)).rejects.toThrow(ArgumentError);

    });

    it('should return the correct object', async () => {

      await expect(service.search('one', resources)).resolves.toEqual([ resources[0] ]);

    });

    it('should return the correct objects', async () => {

      await expect(service.search('two', resources)).resolves.toEqual([ resources[1] ]);

    });

    it('should error when searchTerm is undefined', async () => {

      await expect(service.search(undefined, resources)).rejects.toThrow(ArgumentError);

    });

    it('should error when collections is undefined', async () => {

      await expect(service.search('test', undefined)).rejects.toThrow(ArgumentError);

    });

  });

});
