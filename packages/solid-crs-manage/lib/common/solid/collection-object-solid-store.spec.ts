import * as client from '@netwerk-digitaal-erfgoed/solid-crs-client';
import { CollectionObjectSolidStore } from './collection-object-solid-store';

describe('CollectionObjectSolidStore', () => {

  let service: CollectionObjectSolidStore;

  const mockCollection = {
    uri: 'test-uri',
    name: 'test-name',
    description: 'test-description',
    objectsUri: 'test-url',
  };

  beforeEach(() => {

    service = new CollectionObjectSolidStore();

    jest.clearAllMocks();

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
      client.getThingAll = jest.fn(() => null);

      await expect(service.getObjectsForCollection(mockCollection)).resolves.toEqual([]);

    });

    it('should return collection objects', async () => {

      client.getSolidDataset = jest.fn(async () => 'test-dataset');
      client.getThingAll = jest.fn(() => [ 'test-thing' ]);
      client.getStringWithLocale = jest.fn(() => 'test-string');
      client.asUrl = jest.fn(() => 'test-url');

      const result = await service.getObjectsForCollection(mockCollection)
;

      expect(result[0]).toEqual(expect.objectContaining({
        uri: mockCollection.objectsUri,
        collection: mockCollection.uri,
        name: 'test-string',
        description: 'test-string',
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

    it('should throw', async () => {

      await expect(service.delete(undefined)).rejects.toThrow();

    });

  });

  describe('save()', () => {

    it('should throw', async () => {

      await expect(service.save(undefined)).rejects.toThrow();

    });

  });

});
