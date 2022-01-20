import * as sdk from '@digita-ai/inrupt-solid-client';
import { SolidSDKService } from '@digita-ai/inrupt-solid-service';
import fetchMock from 'jest-fetch-mock';
import { createPod } from './app.services';

describe('Authorization Services', () => {

  let solidService: SolidSDKService;

  beforeEach(() => {

    solidService = {
      getStorages: jest.fn(async () => [ 'https://link.to/storage' ]),
      getIssuers: jest.fn(async () =>
        [ { icon: '', description: 'mock issuer', uri: process.env.VITE_ID_PROXY } ]),
      getSession: jest.fn(async () => ({ webId: 'https://web.id/profile' })),
      getDefaultSession: jest.fn(() => ({
        fetch,
        info: {
          sessionId: 'test-id',
          webId: 'https://web.id/',
        },
      })),
    } as any;

  });

  describe('createPod', () => {

    it('should error when session does not contain webId', async () => {

      (solidService.getDefaultSession as unknown) = jest.fn(() => undefined);

      await expect(createPod(solidService)).rejects.toThrow('Not logged in');

    });

    it('should error when first pod request does not return 400', async () => {

      fetchMock.mockOnce(async() => 'success');

      await expect(createPod(solidService)).rejects.toThrow('Server returned error (first request)');

    });

    it('should error when no profile thing could be found when writing oidc registration', async () => {

      fetchMock.mockOnce(async () => ({
        body: JSON.stringify({
          details: {
            quad: '<webid> <http://www.w3.org/ns/solid/terms#oidcIssuerRegistrationToken> "token"',
          },
        }),
        init: { status: 400 },
      }));

      (sdk.getSolidDataset as unknown) = jest.fn(async () => true);
      (sdk.getThing as unknown) = jest.fn(() => null);

      await expect(createPod(solidService)).rejects.toThrow('Could not retrieve profile for');

    });

    it('should error when second pod request was unsuccessful', async () => {

      fetchMock.mockOnce(async () => ({
        body: JSON.stringify({
          details: {
            quad: '<webid> <http://www.w3.org/ns/solid/terms#oidcIssuerRegistrationToken> "token"',
          },
        }),
        init: { status: 400 },
      }));

      fetchMock.mockOnce(async () => ({
        body: 'internal server error',
        init: { status: 500 },
      }));

      (sdk.getSolidDataset as unknown) = jest.fn(async () => true);
      (sdk.getThing as unknown) = jest.fn(() => true);
      (sdk.addStringNoLocale as unknown) = jest.fn(() => true);
      (sdk.setThing as unknown) = jest.fn(() => true);
      (sdk.saveSolidDatasetAt as unknown) = jest.fn(async () => true);

      await expect(createPod(solidService)).rejects.toThrow('Server returned error (second request)');

    });

    it('should error when no profile thing could be found when writing storage', async () => {

      fetchMock.mockOnce(async () => ({
        body: JSON.stringify({
          details: {
            quad: '<webid> <http://www.w3.org/ns/solid/terms#oidcIssuerRegistrationToken> "token"',
          },
        }),
        init: { status: 400 },
      }));

      fetchMock.mockOnce(async() => '{"status": "success"}');

      let checkingStorage = false;

      (sdk.getSolidDataset as unknown) = jest.fn(async () => true);

      (sdk.getThing as unknown) = jest.fn(() => {

        if (!checkingStorage) {

          // pass first time
          checkingStorage = true;

          return true;

        } else {

          // second time, return null
          return null;

        }

      });

      (sdk.addStringNoLocale as unknown) = jest.fn(() => true);
      (sdk.setThing as unknown) = jest.fn(() => true);
      (sdk.saveSolidDatasetAt as unknown) = jest.fn(async () => true);

      await expect(createPod(solidService)).rejects.toThrow('Could not retrieve profile for');

    });

    it('should return the webId when succesful', async () => {

      fetchMock.mockOnce(async () => ({
        body: JSON.stringify({
          details: {
            quad: '<webid> <http://www.w3.org/ns/solid/terms#oidcIssuerRegistrationToken> "token"',
          },
        }),
        init: { status: 400 },
      }));

      fetchMock.mockOnce(async() => '{"status": "success"}');

      (sdk.getSolidDataset as unknown) = jest.fn(async () => true);
      (sdk.getThing as unknown) = jest.fn(() => true);
      (sdk.addStringNoLocale as unknown) = jest.fn(() => true);
      (sdk.getUrl as unknown) = jest.fn(() => true);
      (sdk.addUrl as unknown) = jest.fn(() => true);
      (sdk.setThing as unknown) = jest.fn(() => true);
      (sdk.saveSolidDatasetAt as unknown) = jest.fn(async () => true);
      (sdk.overwriteFile as unknown) = jest.fn(async () => true);

      await expect(createPod(solidService)).resolves.toEqual(solidService.getDefaultSession().info.webId);

    });

    it('should create privateTypeIndex file when triple missing from pod', async () => {

      fetchMock.mockOnce(async () => ({
        body: JSON.stringify({
          details: {
            quad: '<webid> <http://www.w3.org/ns/solid/terms#oidcIssuerRegistrationToken> "token"',
          },
        }),
        init: { status: 400 },
      }));

      fetchMock.mockOnce(async() => '{"status": "success"}');

      fetchMock.mockOnce(async () => ({
        init: { status: 404 },
      }));

      (sdk.getSolidDataset as unknown) = jest.fn(async () => true);
      (sdk.getThing as unknown) = jest.fn(() => true);
      (sdk.addStringNoLocale as unknown) = jest.fn(() => true);
      (sdk.addUrl as unknown) = jest.fn(() => true);

      (sdk.getUrl as unknown) = jest.fn((t, predicate) =>
        predicate !== 'http://www.w3.org/ns/solid/terms#privateTypeIndex');

      (sdk.setThing as unknown) = jest.fn(() => true);
      (sdk.saveSolidDatasetAt as unknown) = jest.fn(async () => true);
      (sdk.overwriteFile as unknown) = jest.fn(async () => true);

      await expect(createPod(solidService)).resolves.toEqual(solidService.getDefaultSession().info.webId);
      expect(sdk.overwriteFile).toHaveBeenCalledTimes(1);

    });

    it('should create publicTypeIndex file when triple missing from pod', async () => {

      fetchMock.mockOnce(async () => ({
        body: JSON.stringify({
          details: {
            quad: '<webid> <http://www.w3.org/ns/solid/terms#oidcIssuerRegistrationToken> "token"',
          },
        }),
        init: { status: 400 },
      }));

      fetchMock.mockOnce(async() => '{"status": "success"}');

      fetchMock.mockOnce(async () => ({
        init: { status: 404 },
      }));

      fetchMock.mockOnce(async () => ({
        init: { status: 404 },
      }));

      (sdk.getSolidDataset as unknown) = jest.fn(async () => true);
      (sdk.getThing as unknown) = jest.fn(() => true);
      (sdk.addStringNoLocale as unknown) = jest.fn(() => true);
      (sdk.addUrl as unknown) = jest.fn(() => true);

      (sdk.getUrl as unknown) = jest.fn((t, predicate) =>
        predicate !== 'http://www.w3.org/ns/solid/terms#publicTypeIndex');

      (sdk.setThing as unknown) = jest.fn(() => true);
      (sdk.saveSolidDatasetAt as unknown) = jest.fn(async () => true);
      (sdk.overwriteFile as unknown) = jest.fn(async () => true);

      await expect(createPod(solidService)).resolves.toEqual(solidService.getDefaultSession().info.webId);
      expect(sdk.overwriteFile).toHaveBeenCalledTimes(2);

    });

  });

});
