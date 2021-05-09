import { Collection } from '../collections/collection';
import { MemoryStore } from './memory-store';

describe('MemoryStore', () => {

  const resources: Collection[] = [
    {
      uri: 'collection-uri-1',
      name: 'Collection 1',
      description: 'This is collection 1',
    },
    {
      uri: 'collection-uri-2',
      name: 'Collection 2',
      description: 'This is collection 2',
    },
  ];

  let service: MemoryStore<Collection>;

  beforeEach(async () => {

    service = new MemoryStore(resources);

  });

  it('should be correctly instantiated', () => {

    expect(service).toBeTruthy();

  });

  describe('all', () => {

    it('should return all resources', async (done) => {

      service.all().subscribe((collections) => {

        expect(collections).toEqual(resources);

        done();

      });

    });

  });

});
