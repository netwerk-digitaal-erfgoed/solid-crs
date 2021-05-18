import { Collection } from '../collections/collection';
import { ArgumentError } from '../errors/argument-error';
import { MemoryStore } from './memory-store';

describe('MemoryStore', () => {

  const collection1: Collection = {
    uri: 'collection-uri-1',
    name: 'Collection 1',
    description: 'This is collection 1',
    objectsUri: 'objects-uri',
    distribution: 'distribution-uri',
  };

  const collection2: Collection = {
    uri: 'collection-uri-2',
    name: 'Collection 2',
    description: 'This is collection 2',
    objectsUri: 'objects-uri',
    distribution: 'distribution-uri',
  };

  const collection3: Collection = {
    uri: 'collection-uri-3',
    name: 'Collection 3',
    description: 'This is collection 3',
    objectsUri: 'objects-uri',
    distribution: 'distribution-uri',
  };

  const collection2Updated: Collection = {
    uri: 'collection-uri-2',
    name: 'Collection 2',
    description: 'This is collection 2 with update',
    objectsUri: 'objects-uri',
    distribution: 'distribution-uri',
  };

  const resources: Collection[] = [ collection1, collection2 ];

  let service: MemoryStore<Collection>;

  beforeEach(async () => {

    service = new MemoryStore(resources);

  });

  it('should be correctly instantiated', () => {

    expect(service).toBeTruthy();

  });

  describe('all', () => {

    it('should return all resources', () => {

      expect(service.all()).resolves.toEqual(resources);

    });

    it('should throw error when resources is null', () => {

      service = new MemoryStore(null);
      expect(service.all()).rejects.toThrow(ArgumentError);

    });

  });

  describe('delete', () => {

    it('should delete an existing resource', async () => {

      const deletedResource = await service.delete(collection1);

      expect(deletedResource).toEqual(collection1);

      const remainingResources = await service.all();

      expect(remainingResources).toEqual([ collection2 ]);

    });

    it('should not delete a non-existing resource', async () => {

      const deletedResource = await service.delete(collection3);

      expect(deletedResource).toEqual(collection3);

      const remainingResources = await service.all();

      expect(remainingResources).toEqual([ collection1, collection2 ]);

    });

    it('should throw an error when no resource is given', () => {

      expect(service.delete(null)).rejects.toThrow(ArgumentError);

    });

    it('should throw an error when no resources are set', () => {

      service = new MemoryStore(null);

      expect(service.delete(collection1)).rejects.toThrow(ArgumentError);

    });

  });

  describe('save', () => {

    it('should not add an existing resource', async () => {

      const savedResource = await service.save(collection1);

      expect(savedResource).toEqual(collection1);

      const remainingResources = await service.all();

      expect(remainingResources).toEqual([ collection2, collection1 ]);

    });

    it('should add a non-existing resource', async () => {

      const savedResource = await service.save(collection3);

      expect(savedResource).toEqual(collection3);

      const remainingResources = await service.all();

      expect(remainingResources).toEqual([ collection1, collection2, collection3 ]);

    });

    it('should add a non-existing resource without uri', async () => {

      const collectionToSave = { ...collection3, uri: null };

      const savedResource = await service.save(collectionToSave);

      expect(savedResource.uri).toBeTruthy();

      const remainingResources = await service.all();

      expect(remainingResources.length).toBe(3);

    });

    it('should update an existing resource', async () => {

      const savedResource = await service.save(collection2Updated);

      expect(savedResource).toEqual(collection2Updated);

      const remainingResources = await service.all();

      expect(remainingResources).toEqual([ collection1, collection2Updated ]);

    });

    it('should throw an error when no resource is given', () => {

      expect(service.save(null)).rejects.toThrow(ArgumentError);

    });

    it('should throw an error when no resources are set', () => {

      service = new MemoryStore(null);

      expect(service.save(collection1)).rejects.toThrow(ArgumentError);

    });

  });

});
