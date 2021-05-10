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

});
