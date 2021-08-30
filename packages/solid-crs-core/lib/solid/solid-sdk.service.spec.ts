import * as client from '@netwerk-digitaal-erfgoed/solid-crs-client';
import fetchMock, { MockResponseInitFunction } from 'jest-fetch-mock';
import { LoggerLevel } from '../logging/logger-level';
import { ConsoleLogger } from '../logging/console-logger';
import { SolidSDKService } from './solid-sdk.service';
fetchMock.enableMocks();

describe('SolidService', () => {

  let service: SolidSDKService;

  beforeEach(async () => {

    const logger = new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly);
    service = new SolidSDKService(logger);

    fetchMock.resetMocks();

  });

  afterEach(() => {

    jest.clearAllMocks();

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

  describe('login()', () => {

    it.each([ null, undefined ])('should error when WebID is %s', async (value) => {

      await expect(service.login(value)).rejects.toThrow('Argument webId should be set.');

    });

    it('should throw when retrieved issuer is falsey', async () => {

      service.getIssuer = jest.fn(() => undefined);

      await expect(service.login('test')).rejects.toThrow('Argument issuer should be set.');

    });

    it('should call login when issuer was set', async () => {

      client.login = jest.fn(() => 'success');
      service.getIssuer = jest.fn(async () => 'http://google.com/');

      await service.login('test');

      expect(client.login).toHaveBeenCalled();

    });

  });

  describe('logout()', () => {

    it.each([ null, undefined ])('should error when WebID is %s', async (value) => {

      client.logout = jest.fn().mockResolvedValue(null);
      await expect(service.logout()).resolves.not.toThrow();

    });

  });

  describe('getIssuer', () => {

    const validOpenIdConfig = JSON.stringify({ solid_oidc_supported: 'https://solidproject.org/TR/solid-oidc' });
    const validProfileDataset = {};
    const validProfileThing = {};

    it.each([
      [ null, validProfileDataset, validOpenIdConfig, 'nde.features.authenticate.error.invalid-webid.no-webid' ],
      [ undefined, validProfileDataset, validOpenIdConfig, 'nde.features.authenticate.error.invalid-webid.no-webid' ],
      [ 'invalid-url', validProfileDataset, validOpenIdConfig, 'nde.features.authenticate.error.invalid-webid.invalid-url' ],
    ])('should error when webId is %s', async (webId, profile: MockResponseInitFunction, openId, message) => {

      client.getSolidDataset = jest.fn(async () => profile);

      fetchMock
        .mockRejectOnce() // fail https:// URL check
        .mockRejectOnce() // fail http:// URL check
        .once(openId);

      await expect(service.getIssuer(webId)).rejects.toThrowError(message);

    });

    it('should error when webId is valid URL, but no profile', async () => {

      client.getSolidDataset = jest.fn(async () => null);

      fetchMock
        .once('') // pass https:// URL check
        .once(validOpenIdConfig);

      await expect(service.getIssuer('https://nde.nl/')).rejects.toThrowError('nde.features.authenticate.error.invalid-webid.no-profile');

    });

    it('should error when unable to set dataset', async () => {

      const webId = 'https://pod.inrupt.com/digitatestpod/profile/card#me';

      client.getSolidDataset = jest.fn(async () => { throw Error(); });

      await expect(service.getIssuer(webId)).rejects.toThrow();

    });

    it('should error when profile is null', async () => {

      const webId = 'https://pod.inrupt.com';

      client.getSolidDataset = jest.fn().mockReturnValueOnce(validProfileDataset);
      client.getThing = jest.fn().mockReturnValueOnce(null);

      await expect(service.getIssuer(webId)).rejects.toThrow();

    });

    it('should error when issuer is null', async () => {

      const webId = 'https://pod.inrupt.com';

      client.getSolidDataset = jest.fn().mockReturnValueOnce(validProfileDataset);
      client.getThing = jest.fn().mockReturnValueOnce(validProfileThing);
      client.getUrl = jest.fn().mockReturnValueOnce(null);

      await expect(service.getIssuer(webId)).rejects.toThrow();

    });

    it('should error when oidcIssuer openid config is invalid', async () => {

      client.getSolidDataset = jest.fn(async () => validProfileDataset);
      client.getThing = jest.fn(async () => validProfileThing);
      client.getUrl = jest.fn(() => 'https://google.com/');

      fetchMock.mockRejectOnce();

      await expect(service.getIssuer('https://pod.inrupt.com/digitatestpod/profile/card#me')).rejects.toThrowError('nde.features.authenticate.error.invalid-webid.invalid-oidc-registration');

    });

    it('should error when oidcIssuer response does not contain "X-Powered-By: solid" header', async () => {

      client.getSolidDataset = jest.fn(async () => validProfileDataset);
      client.getThing = jest.fn(async () => validProfileThing);
      client.getUrl = jest.fn(() => 'https://google.com/');

      fetchMock
        .once('') // pass https:// URL check
        .mockResponseOnce('{}', { status: 200, headers: { 'X-Powered-By': '' } });

      await expect(service.getIssuer('https://pod.inrupt.com/digitatestpod/profile/card#me')).rejects.toThrowError('nde.features.authenticate.error.invalid-webid.invalid-oidc-registration');

    });

    it('should return issuer when openid response contains "X-Powered-By: solid" header', async () => {

      client.getSolidDataset = jest.fn(async () => validProfileDataset);
      client.getThing = jest.fn(async () => validProfileThing);
      client.getUrl = jest.fn(() => 'https://google.com/');

      fetchMock
        .once('') // pass https:// URL check
        .mockResponseOnce('{}', { status: 200, headers: { 'X-Powered-By': 'solid-server/5.6.6' } });

      await expect(service.getIssuer('https://pod.inrupt.com/digitatestpod/profile/card#me')).resolves.toEqual('https://google.com/');

    });

  });

  describe('getProfile', () => {

    const validProfileDataset = {};
    const validProfileThing = {};
    const validName = 'mockString';
    const webId = 'https://pod.inrupt.com/digitatestpod/profile/card#me';

    it('should error when WebID is null', async () => {

      await expect(service.getProfile(null)).rejects.toThrow();

    });

    it('should error when WebID is not a valid url', async () => {

      await expect(service.getProfile('noURL')).rejects.toThrow();

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

    it('should return valid profile when found', async () => {

      client.getSolidDataset = jest.fn(async () => validProfileDataset);
      client.getThing = jest.fn(() => validProfileThing);
      client.getStringNoLocale = jest.fn(() => validName);
      client.getStringWithLocale = jest.fn(() => validName);
      client.getUrl = jest.fn(() => validName);

      const profile = await service.getProfile(webId);

      expect(profile).toEqual(expect.objectContaining({
        name: validName,
        uri: webId,
        alternateName: validName,
        description: validName,
        website: validName,
        logo: validName,
        email: validName,
        telephone: validName,
      }));

    });

  });

});
