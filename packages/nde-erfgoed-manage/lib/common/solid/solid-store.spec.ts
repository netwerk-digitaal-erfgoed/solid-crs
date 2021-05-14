import { Collection } from '@digita-ai/nde-erfgoed-core';
import * as client from '@digita-ai/nde-erfgoed-client';
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

    it('should error when no type registration was found', async () => {

      client.getSolidDataset = jest.fn(async () => 'test-dataset');
      client.getThing = jest.fn(() => 'test-thing');
      client.getUrl = jest.fn(() => 'test-url');
      client.getThingAll = jest.fn(() => []);

      await expect(service.getInstanceForClass('test-webid', 'test-forClass')).rejects.toThrow('No type registration found');

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
