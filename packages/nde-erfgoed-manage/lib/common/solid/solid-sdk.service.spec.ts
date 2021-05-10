import * as client from '@digita-ai/nde-erfgoed-client';
import { ConsoleLogger, LoggerLevel } from '@digita-ai/nde-erfgoed-core';
import fetchMock, { MockResponseInitFunction } from 'jest-fetch-mock';
import { SolidSDKService } from './solid-sdk.service';

describe('SolidService', () => {

  let service: SolidSDKService;

  beforeEach(async () => {

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nodeCrypto = require('crypto');

    window.crypto = {
      getRandomValues: (buffer) => nodeCrypto.randomFillSync(buffer),
    };

    const logger = new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly);
    service = new SolidSDKService(logger);

    fetchMock.mockClear();

  });

  it('should be correctly instantiated', () => {

    expect(service).toBeTruthy();

  });

  it.each([
    [ { webId: 'lorem', isLoggedIn: true }, { webId: 'lorem' } ],
    [ { webId: 'lorem', isLoggedIn: false }, null ],
    [ null, null ],
  ])('should call handleIncomingRedirect when getting session', async (resolved, result) => {

    client.handleIncomingRedirect = jest.fn(async () => resolved);

    expect(await service.getSession()).toEqual(result);

  });

  //   describe('login()', () => {

  //     it.each([ null, undefined ])('should error when WebID is %s', async () => {
  //       await expect(service.login(null)
  //         .toPromise()).rejects.toThrow('invalid-webid.no-webid');
  //     });

  //     it('should error when WebID is an invalid URL', async () => {
  //       await expect(service.login('a')
  //         .toPromise()).rejects.toThrow('invalid-webid.invalid-url');
  //     });

  //     it('should error when WebID does not contain profile', async () => {
  //       await expect(service.login('https://google.com/')
  //         .toPromise()).rejects.toThrow('invalid-webid.no-profile');
  //     });

  //     it('should error when WebID does not contain oidcIssuer triple', async () => {
  //       await expect(service.login('https://pod.inrupt.com/digitatestpod/settings/publicTypeIndex.ttl')
  //         .toPromise()).rejects.toThrow('invalid-webid.no-oidc-issuer');
  //     });

  //     it('should error when WebID does not contain valid oidcIssuer value', async () => {
  //       (service as any).validateOidcIssuer = jest.fn().mockImplementationOnce(() => of(false));
  //       await expect(service.login('https://pod.inrupt.com/digitatestpod/profile/card#me')
  //         .toPromise()).rejects.toThrow('invalid-webid.invalid-oidc-issuer');
  //     });

  //     it('should call login when WebID is valid', async () => {
  //       const loginSpy = jest.spyOn(solid, 'login');
  //       // assuming webid is valid
  //       (service as any).validateWebId = jest.fn().mockImplementationOnce(() => of('https://broker.pod.inrupt.com/'));
  //       await service.login('webId').toPromise();
  //       expect(loginSpy).toHaveBeenCalledTimes(1);
  //     });
  //   });

  describe('getIssuer', () => {

    const validOpenIdConfig = JSON.stringify({ solid_oidc_supported: 'https://solidproject.org/TR/solid-oidc' });
    const validProfileDataset = {};
    const validProfileThing = {};

    it.each([
      [ null, validProfileDataset, validOpenIdConfig, 'nde.features.authenticate.error.invalid-webid.no-webid' ],
      [ undefined, validProfileDataset, validOpenIdConfig, 'nde.features.authenticate.error.invalid-webid.no-webid' ],
      [ 'invalid-url', validProfileDataset, validOpenIdConfig, 'nde.features.authenticate.error.invalid-webid.invalid-url' ],
      [ 'https://nde.nl/', null, validOpenIdConfig, 'nde.features.authenticate.error.invalid-webid.no-profile' ],
    ])('should error when webId is %s', async (webId, profile: MockResponseInitFunction, openId, message) => {

      client.getSolidDataset = jest.fn(async () => profile);

      fetchMock.mockResponses(openId);

      await expect(service.getIssuer(webId)).rejects.toThrowError(message);

    });

    it('should error when oidcIssuer openid config is not found', async () => {

      client.getSolidDataset = jest.fn(async () => validProfileDataset);
      client.getThing = jest.fn(async () => validProfileThing);
      client.getUrl = jest.fn(async () => 'https://google.com/');

      fetchMock.mockResponseOnce('<!DOCTYPE html>', { status: 404 });

      await expect(service.getIssuer('https://pod.inrupt.com/digitatestpod/profile/card#me')).rejects.toThrowError('nde.features.authenticate.error.invalid-webid.invalid-oidc-registration');

    });

  });

  describe('getProfile', () => {

    const validProfileDataset = {};
    const validProfileThing = {};
    const validName = 'mockString';
    const webId = 'https://pod.inrupt.com/digitatestpod/profile/card#me';

    it('should error when WebID is %s', async () => {

      await expect(service.getProfile(null)).rejects.toThrow();

    });

    it('should error when unable to set dataset', async () => {

      client.getSolidDataset = jest.fn(async () => { throw Error(); });

      await expect(service.getProfile(webId)).rejects.toThrow();

    });

    it('should error when no dataset is found', async () => {

      client.getSolidDataset = jest.fn(async () =>  null);

      await expect(service.getProfile(webId)).rejects.toThrow();

    });

    it('should error when no profile is found', async () => {

      client.getSolidDataset = jest.fn(async () => validProfileDataset);
      client.getThing = jest.fn(() => null);

      await expect(service.getProfile(webId)).rejects.toThrow();

    });

    it('should return name and photo when a valid profile is found', async () => {

      client.getSolidDataset = jest.fn(async () => validProfileDataset);
      client.getThing = jest.fn(() => validProfileThing);
      client.getStringNoLocale = jest.fn(() => validName);

      const profile = await service.getProfile(webId);

      expect(profile).toEqual(expect.objectContaining({ name: validName }));

    });

  });

});
