import { ArgumentError } from '../errors/argument-error';
import { CollectionObject } from './collection-object';
import { CollectionObjectMemoryStore } from './collection-object-memory-store';

describe('CollectionObjectMemoryStore', () => {

  const collection1 = {
    uri: 'collection-uri-1',
    name: 'Collection 1',
    description: 'This is collection 1',
  };

  const resources: CollectionObject[] = [
    {
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
    },
    {
      uri: 'object-uri-3',
      name: 'Object 3',
      description: 'This is object 3',
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

    it('should return all resources', async (done) => {

      service.all().subscribe((objects) => {

        expect(objects).toEqual(resources);

        done();

      });

    });

  });

  describe('getObjectsForCollection', () => {

    it('should return all resources in collection', async (done) => {

      service.getObjectsForCollection(collection1).subscribe((collections) => {

        expect(collections).toEqual([ {
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

        done();

      });

    });

    it('should throw error when collection is null', () => {

      expect(() => service.getObjectsForCollection(null)).toThrow(ArgumentError);

    });

    it('should throw error when resources is null', () => {

      service = new CollectionObjectMemoryStore(null);
      expect(() => service.getObjectsForCollection(collection1)).toThrow(ArgumentError);

    });

  });

});
