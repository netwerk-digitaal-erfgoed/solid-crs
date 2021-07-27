import { Collection } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import * as client from '@netwerk-digitaal-erfgoed/solid-crs-client';
import { SolidStore } from './solid-store';

describe('SolidStore', () => {

  let service: SolidStore<Collection>;

  beforeEach(() => {

    service = new SolidStore();

    jest.clearAllMocks();

  });

  it('should instantiate', () => {

    expect(service).toBeTruthy();

  });

  describe('getInstanceForClass', () => {

    it.each([ null, undefined ])('should error when webId is %s', async (value) => {

      await expect(service.getInstanceForClass(value, 'test-string')).rejects.toThrow('Argument webId should be set');

    });

    it.each([ null, undefined ])('should error when forClass is %s', async (value) => {

      await expect(service.getInstanceForClass('test-string', value)).rejects.toThrow('Argument forClass should be set');

    });

    it('should return null when no type index reference was found in profile', async () => {

      client.getSolidDataset = jest.fn(async () => 'test-dataset');
      client.getThing = jest.fn(() => 'test-thing');
      client.getUrl = jest.fn(() => null);

      await expect(service.getInstanceForClass('test-webid', 'test-forClass')).resolves.toEqual(null);

    });

    it('should return null when no type registration was found', async () => {

      client.getSolidDataset = jest.fn(async () => 'test-dataset');
      client.getThing = jest.fn(() => 'test-thing');
      client.getUrl = jest.fn(() => 'test-url');
      client.getThingAll = jest.fn(() => []);

      await expect(service.getInstanceForClass('test-webid', 'test-forClass')).resolves.toEqual(null);

    });

    it('should return correct type registration', async () => {

      client.getSolidDataset = jest.fn(async () => 'test-dataset');
      client.getThing = jest.fn(() => 'test-thing');

      client.getUrl = jest.fn((thing, predicate) => {

        if (predicate === 'http://www.w3.org/ns/solid/terms#forClass') {

          return 'test-forClass';

        }

        return 'test-url';

      });

      client.getThingAll = jest.fn(() => [ 'test-forClass' ]);

      await expect(service.getInstanceForClass('test-webid', 'test-forClass')).resolves.toEqual('test-url');

    });

  });

  describe('saveInstanceForClass()', () => {

    it.each([ null, undefined ])('should error when webId is %s', async (value) => {

      await expect(service.saveInstanceForClass(value, 'test-string', 'test-string')).rejects.toThrow('Argument webId should be set');

    });

    it.each([ null, undefined ])('should error when forClass is %s', async (value) => {

      await expect(service.saveInstanceForClass('test-string', value, 'test-string')).rejects.toThrow('Argument forClass should be set');

    });

    it.each([ null, undefined ])('should error when location is %s', async (value) => {

      await expect(service.saveInstanceForClass('test-string', 'test-string', value)).rejects.toThrow('Argument location should be set');

    });

  });

  it('should return instance when registration is already present', async () => {

    client.getSolidDataset = jest.fn(async () => 'test-dataset');
    client.getThing = jest.fn(() => 'test-thing');
    client.getThingAll = jest.fn(() => [ 'test-thing' ]);

    client.getUrl = jest.fn((thing, predicate) => {

      if (predicate === 'http://www.w3.org/ns/solid/terms#publicTypeIndex') {

        return 'https://test.url/';

      } else if (predicate === 'http://www.w3.org/ns/pim/space#storage') {

        return 'https://test.url/test-storage';

      } else if (predicate === 'http://www.w3.org/ns/solid/terms#forClass') {

        return 'https://test.url/test-forClass';

      } else if (predicate === 'http://www.w3.org/ns/solid/terms#instance') {

        return 'https://test.url/test-storage/test-location';

      }

    });

    await expect(service.saveInstanceForClass('test-webid', 'https://test.url/test-forClass', 'https://test.url/test-storage/test-location'))
      .resolves.toEqual('https://test.url/test-storage/test-location');

  });

  it('should save new instance when registration was not present', async () => {

    client.getSolidDataset = jest.fn(async () => 'test-dataset');
    client.getThing = jest.fn(() => 'test-thing');
    client.getThingAll = jest.fn(() => []);
    client.createThing = jest.fn(() => 'test-thing');
    client.addUrl = jest.fn(() => 'test-thing');
    client.setThing = jest.fn(() => 'test-dataset');
    client.saveSolidDatasetAt = jest.fn(async () => 'test-dataset');

    await expect(service.saveInstanceForClass('test-webid', 'https://test.url/test-forClass', 'https://test.url/test-storage/test-location'))
      .resolves.toEqual('https://test.url/test-storage/test-location');

    expect(client.saveSolidDatasetAt).toHaveBeenCalledTimes(1);

  });

  it('should call this.createTypeIndexes when no typeindex was found', async () => {

    const createTypeIndexSpy = jest.spyOn(service, 'createTypeIndexes');

    client.getSolidDataset = jest.fn(async () => 'test-dataset');
    client.getThing = jest.fn(() => 'test-thing');
    client.getThingAll = jest.fn(() => [ 'test-thing' ]);

    client.getUrl = jest.fn((thing, predicate) => {

      if (predicate === 'http://www.w3.org/ns/solid/terms#publicTypeIndex') {

        return null;

      } else if (predicate === 'http://www.w3.org/ns/pim/space#storage') {

        return 'https://test.url/test-storage';

      } else if (predicate === 'http://www.w3.org/ns/solid/terms#forClass') {

        return 'https://test.url/test-forClass';

      } else if (predicate === 'http://www.w3.org/ns/solid/terms#instance') {

        return 'https://test.url/test-storage/test-location';

      }

    });

    await expect(service.saveInstanceForClass('https://test.webid/profile/card#me', 'https://test.url/test-forClass', 'https://test.url/test-storage/test-location'))
      .resolves.toEqual('https://test.url/test-storage/test-location');

    expect(createTypeIndexSpy).toHaveBeenCalled();

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

  describe('get()', () => {

    it('should throw', async () => {

      await expect(service.get(undefined)).rejects.toThrow();

    });

  });

  describe('createTypeIndexes()', () => {

    client.getSolidDataset = jest.fn(async () => 'test-dataset');
    client.getThing = jest.fn(() => 'test-thing');
    client.overwriteFile = jest.fn(async () => 'test-result');
    client.addUrl = jest.fn(() => 'test-thing');
    client.setThing = jest.fn(() => 'test-dataset');
    client.saveSolidDatasetAt = jest.fn(async () => 'test-result');

    client.access = {
      setPublicAccess: async () => null,
    };
    // client.access.setPublicAccess = jest.fn(async () => null);

    it.each([ null, undefined ])('should error when webId is %s', async (value) => {

      await expect(service.createTypeIndexes(value)).rejects.toThrow('Argument webId should be set');

    });

    it('should throw when webId does not ends with "profile/card#me"', async () => {

      await expect(service.createTypeIndexes('http://test')).rejects.toThrow('Could not create type indexes for webId');

    });

    it('should write files and return private and public type index URLs', async () => {

      const result = await service.createTypeIndexes('http://test.url/profile/card#me');

      expect(result.privateTypeIndex).toEqual('http://test.url/settings/privateTypeIndex.ttl');
      expect(result.publicTypeIndex).toEqual('http://test.url/settings/publicTypeIndex.ttl');

      expect(client.saveSolidDatasetAt).toHaveBeenCalled();
      // expect(client.access.setPublicAccess).toHaveBeenCalled();
      expect(client.overwriteFile).toHaveBeenCalledTimes(2);

    });

  });

});
