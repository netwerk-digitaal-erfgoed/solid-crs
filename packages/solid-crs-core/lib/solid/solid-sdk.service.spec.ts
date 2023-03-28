/* eslint-disable @typescript-eslint/no-explicit-any */
import * as client from '@netwerk-digitaal-erfgoed/solid-crs-client';
import fetchMock from 'jest-fetch-mock';
import { Issuer } from '@digita-ai/inrupt-solid-service';
import { SolidSDKService } from './solid-sdk.service';
fetchMock.enableMocks();

describe('SolidService', () => {

  const webId = 'https://pod.inrupt.com/digitatestpod/profile/card#me';

  let service: SolidSDKService;

  beforeEach(async () => {

    service = new SolidSDKService({
      clientName: 'test',
      clientId: 'test.id',
    });

    fetchMock.resetMocks();

  });

  afterEach(() => {

    jest.clearAllMocks();

  });

  it('should be correctly instantiated', () => {

    expect(service).toBeTruthy();

  });

  describe('getSession', () => {

    it('should return session info from handleIncomingRedirect', async () => {

      (client.handleIncomingRedirect as any) = jest.fn(async () => ({
        webId: 'lorem',
        isLoggedIn: true,
      }));

      await expect(service.getSession()).resolves.toEqual({ webId: 'lorem' });

    });

    it('should throw when session invalid (isLoggedIn false)', async () => {

      (client.handleIncomingRedirect as any) = jest.fn(async () => ({
        webId: 'lorem',
        isLoggedIn: false,
      }));

      await expect(service.getSession()).rejects.toBeUndefined();

    });

    it('should throw when session invalid (webId undefined)', async () => {

      (client.handleIncomingRedirect as any) = jest.fn(async () => ({
        webId: undefined,
        isLoggedIn: true,
      }));

      await expect(service.getSession()).rejects.toBeUndefined();

    });

    it('should throw when session is undefined', async () => {

      (client.handleIncomingRedirect as any) = jest.fn(async () => undefined);

      await expect(service.getSession()).rejects.toBeUndefined();

    });

  });

  describe('login', () => {

    const mockIssuer: Issuer = {
      uri: 'https://issuer/',
      icon: 'https://issuer/icon.png',
      description: 'mock issuer',
    };

    const mockIssuer2: Issuer = {
      uri: 'https://issuer-2/',
      icon: 'https://issuer-2/icon.png',
      description: 'mock issuer 2',
    };

    const mockClient = {
      clientName: 'test',
      clientSecret: 'mockSecret',
      clientId: 'mockId',
    };

    it('should error when webId is undefined', async () => {

      service.getIssuers = jest.fn(async () => [ mockIssuer ]);
      await expect(service.login(undefined as unknown as any)).rejects.toThrow('WebId should be set.: ');

    });

    it('should error when issuer could not be found', async () => {

      (service.getIssuer as any) = jest.fn(async () => undefined);
      await expect(service.login('https://web.id/')).rejects.toThrow('Issuer should be set.: ');

    });

    it('should call login with correct clientname', async () => {

      (client.login as any) = jest.fn();
      service.getIssuers = jest.fn(async () => [ mockIssuer ]);

      await service.login('https://web.id/');

      expect(client.login).toHaveBeenCalledWith(expect.objectContaining({
        oidcIssuer: mockIssuer.uri,
        clientName: mockClient.clientName,
      }));

    });

    it('should call login with correct clientname, secret and id if set', async () => {

      service = new SolidSDKService(mockClient);

      (client.login as any) = jest.fn();
      service.getIssuers = jest.fn(async () => [ mockIssuer ]);

      await service.login('https://web.id/');

      expect(client.login).toHaveBeenCalledWith(expect.objectContaining({
        oidcIssuer: mockIssuer.uri,
        clientName: mockClient.clientName,
        clientId: mockClient.clientId,
        clientSecret: mockClient.clientSecret,
      }));

    });

  });

  describe('logout()', () => {

    it.each([ null, undefined ])('should error when WebID is %s', async () => {

      (client.logout as any) = jest.fn().mockResolvedValue(null);
      await expect(service.logout()).resolves.not.toThrow();

    });

  });

  describe('getIssuer', () => {

    const mockIssuers: Issuer[] = [
      {
        uri: 'https://issuer.example.com/',
        description: 'mockIssuer',
        icon: 'mockIssuer.png',
      },
      {
        uri: 'https://other-issuer.example.com/',
        description: 'mockIssuer',
        icon: 'mockIssuer.png',
      },
    ];

    beforeEach(() => {

      service.getIssuers = jest.fn(async () => mockIssuers);

    });

    it('should return first issuer uri from this.getIssuers', async () => {

      const issuer = await service.getIssuer(webId);

      expect(issuer).toEqual(mockIssuers[0].uri);

    });

  });

  describe('getProfile', () => {

    const validProfileDataset = {};
    const validProfileThing = {};
    const validName = 'mockString';

    it('should error when WebID is null', async () => {

      await expect(service.getProfile(null as unknown as any)).rejects.toThrow();

    });

    it('should error when WebID is not a valid url', async () => {

      await expect(service.getProfile('noURL')).rejects.toThrow();

    });

    it('should error when unable to set dataset', async () => {

      (client.getSolidDataset as any) = jest.fn(async () => { throw Error(); });

      await expect(service.getProfile(webId)).rejects.toThrow();

    });

    it('should error when no dataset is found', async () => {

      (client.getSolidDataset as any) = jest.fn(async () =>  null);

      await expect(service.getProfile(webId)).rejects.toThrow();

    });

    it('should error when no profile is found', async () => {

      (client.getSolidDataset as any) = jest.fn(async () => validProfileDataset);
      (client.getThing as any) = jest.fn(() => null);

      await expect(service.getProfile(webId)).rejects.toThrow();

    });

    it('should error when no contactPointThing could be found', async () => {

      (client.getSolidDataset as any) = jest.fn(async () => validProfileDataset);

      (client.getThing as any) = jest.fn((d, url) =>
        url === validName ? undefined : validProfileThing);

      (client.getStringNoLocale as any) = jest.fn(() => validName);
      (client.getStringWithLocale as any) = jest.fn(() => validName);
      (client.getUrl as any) = jest.fn(() => validName);

      await expect(service.getProfile(webId)).rejects.toThrow('Could not find contactPointThing in dataset');

    });

    it('should return valid profile when found', async () => {

      (client.getSolidDataset as any) = jest.fn(async () => validProfileDataset);
      (client.getThing as any) = jest.fn(() => validProfileThing);
      (client.getStringNoLocale as any) = jest.fn(() => validName);
      (client.getStringWithLocale as any) = jest.fn(() => validName);
      (client.getUrl as any) = jest.fn(() => validName);

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
