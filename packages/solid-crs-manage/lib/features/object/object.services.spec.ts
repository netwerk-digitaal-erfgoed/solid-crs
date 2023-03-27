import * as sdk from '@netwerk-digitaal-erfgoed/solid-crs-client';
import { ClickedImportUpdates, ObjectEvent } from './object.events';
import { importUpdates, loadNotifications } from './object.services';

describe('objectServices', () => {

  const context = {
    object: {
      uri: 'https://object.uri/',
      maintainer: 'https://maintainer.uri/',
      collection: 'https://collection.uri/',
    },
    objectStore: {
      get: jest.fn(async () => ({
        uri: 'https://object.uri/',
        maintainer: 'https://maintainer.uri/',
        collection: 'https://collection.uri/',
      })),
      getInbox: jest.fn(async () => 'https://inbox.uri/'),
    },
    solidService: {
      getDefaultSession: jest.fn(() => ({
        fetch: jest.fn(),
      })),
    },
  } as any;

  describe('loadNotifications', () => {

    beforeEach(() => {

      (sdk.getSolidDataset as any) = jest.fn(async () => 'dataset');
      (sdk.getThing as any) = jest.fn(() => 'thing');
      (sdk.asUrl as any) = jest.fn(() => 'url');

      (sdk.getUrl as any) = jest.fn((thing, predicate) => {

        if (predicate === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {

          return 'https://www.w3.org/ns/activitystreams#Update';

        }

        if (predicate === 'https://www.w3.org/ns/activitystreams#object') {

          return 'https://object.uri/';

        }

        return 'url';

      });

      (sdk.getUrlAll as any) = jest.fn(() => [ 'url' ]);

    });

    it('should return notifications', async () => {

      const mockNotification = {
        uri: 'url',
        originalObject: 'url',
        updatedObject: 'https://object.uri/',
        from: 'url',
        to: 'url',
      };

      await expect(loadNotifications(context, undefined))
        .resolves.toEqual([ mockNotification ]);

    });

  });

  describe('importUpdates', () => {

    it('should error when event not of ClickedImportUpdates type ', async () => {

      await expect(importUpdates(context, {} as ObjectEvent))
        .rejects.toThrow('Event is not of type ClickedImportUpdates');

    });

    it('should return updated CollectionObject', async () => {

      await expect(importUpdates(context, new ClickedImportUpdates('https://collection.uri/')))
        .resolves.toEqual({
          uri: 'https://object.uri/',
          maintainer: 'https://maintainer.uri/',
          collection: 'https://collection.uri/',
        });

    });

  });

});
