/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as client from '@netwerk-digitaal-erfgoed/solid-crs-client';
import fetchMock from 'jest-fetch-mock';
import { Issuer, Source } from '@digita-ai/inrupt-solid-service';
import { createSolidDataset, createThing, getDefaultSession, login, saveSolidDatasetAt  } from '@netwerk-digitaal-erfgoed/solid-crs-client';
import { SolidSDKService } from './solid-sdk.service';
fetchMock.enableMocks();

describe('SolidService', () => {

  const webId = 'https://not-use.id/person';
  const issuer  = 'https://issuer.example.com/';

  const mockClient = {
    clientName: 'test',
    clientSecret: 'mockSecret',
    clientId: 'mockId',
  };

  const storage = 'https://storage.example.com/person-storage/';
  const profileThing = createThing({ url: webId });

  const mockIssuer: Issuer = {
    uri: issuer,
    description: 'mockIssuer',
    icon: 'mockIssuer.png',
  };

  const mockIssuer2: Issuer = {
    uri: 'https://other-issuer.example.com/',
    description: 'mockIssuer',
    icon: 'mockIssuer.png',
  };

  const mockIssuers = [ mockIssuer, mockIssuer2 ];

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

  describe('validateIssuer', () => {

    it('should return false when openIdConfig response is not OK', async () => {

      fetchMock.once('not found', {
        status: 404,
      });

      await expect(service.validateIssuer(issuer)).resolves.toBeFalsy();

    });

    it('should return false when openIdConfig response body is invalid JSON', async () => {

      fetchMock.once('invalid json', {
        status: 200,
      });

      await expect(service.validateIssuer(issuer)).resolves.toBeFalsy();

    });

    it('should return false when openIdConfig response body is empty', async () => {

      fetchMock.once('', {
        status: 200,
      });

      await expect(service.validateIssuer(issuer)).resolves.toBeFalsy();

    });

    it('should return true when non-Inrupt issuer', async () => {

      fetchMock.once(`{}`, {
        status: 200,
      });

      await expect(service.validateIssuer(issuer)).resolves.toBeTruthy();

    });

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

  describe('loginWithIssuer', () => {

    it('should error when issuer is undefined', async () => {

      await expect(service.loginWithIssuer(undefined as unknown as any))
        .rejects.toThrow('Issuer should be set.: ');

    });

    it('should call login with correct clientname', async () => {

      (login as any) = jest.fn();

      await service.loginWithIssuer(mockIssuer);

      expect(client.login).toHaveBeenCalledWith(expect.objectContaining({
        oidcIssuer: mockIssuer.uri,
        clientName: mockClient.clientName,
      }));

    });

    it('should call login with correct clientname, secret and id if set', async () => {

      service = new SolidSDKService(mockClient);
      (login as any) = jest.fn();

      await service.loginWithIssuer(mockIssuer);

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

    beforeEach(() => {

      service.getIssuers = jest.fn(async () => mockIssuers);

    });

    it('should return first issuer uri from this.getIssuers', async () => {

      const result = await service.getIssuer(webId);

      expect(result).toEqual(mockIssuers[0].uri);

    });

  });

  describe('getIssuers', () => {

    it('should throw when webId undefined', async () => {

      await expect(service.getIssuers(undefined as unknown as any)).rejects.toThrow('authenticate.error.invalid-webid.invalid-url');

    });

    it('should throw when webId is invalid URL', async () => {

      await expect(service.getIssuers('invalid')).rejects.toThrow('authenticate.error.invalid-webid.invalid-url');

    });

    it('should throw when valid issuers is empty', async () => {

      service['getProfileThing'] = jest.fn().mockResolvedValue(profileThing);
      service['validateIssuer'] = jest.fn().mockResolvedValue(false);
      (client.getUrlAll as any) = jest.fn().mockReturnValue([]);

      await expect(service.getIssuers(webId)).rejects.toThrow('No valid OIDC issuers for WebID:');

    });

    it('should return list of issuers that are valid', async () => {

      service['getProfileThing'] = jest.fn().mockResolvedValue(profileThing);
      service['validateIssuer'] = jest.fn().mockResolvedValue(true);
      (client.getUrlAll as any) = jest.fn().mockReturnValue([ mockIssuer.uri ]);

      await expect(service.getIssuers(webId)).resolves.toEqual([
        {
          'description': 'Example',
          'icon': 'https://issuer.example.com/favicon.ico',
          'uri': 'https://issuer.example.com/',
        },
      ]);

    });

    it('should return list of issuers that are valid (uri no trailing slash)', async () => {

      service['getProfileThing'] = jest.fn().mockResolvedValue(profileThing);
      service['validateIssuer'] = jest.fn().mockResolvedValue(true);
      (client.getUrlAll as any) = jest.fn().mockReturnValue([ mockIssuer.uri.replace(/\/$/, '') ]);

      await expect(service.getIssuers(webId)).resolves.toEqual([
        {
          'description': 'Example',
          'icon': 'https://issuer.example.com/favicon.ico',
          'uri': 'https://issuer.example.com',
        },
      ]);

    });

    it('should return list of issuers that are valid (host <= 2 parts)', async () => {

      service['getProfileThing'] = jest.fn().mockResolvedValue(profileThing);
      service['validateIssuer'] = jest.fn().mockResolvedValue(true);
      (client.getUrlAll as any) = jest.fn().mockReturnValue([ 'https://iss.com/' ]);

      await expect(service.getIssuers(webId)).resolves.toEqual([
        {
          'description': 'Iss',
          'icon': 'https://iss.com/favicon.ico',
          'uri': 'https://iss.com/',
        },
      ]);

    });

  });

  describe('addIssuers', () => {

    it('should add issuer triples to profile', async () => {

      service['getProfileThing'] = jest.fn(async () => profileThing);
      service['getProfileDataset'] = jest.fn(async () => createSolidDataset());
      (saveSolidDatasetAt as unknown as any) = jest.fn(async () => createSolidDataset());

      const newIssuers: Issuer[] = [ {
        icon: '',
        description: '',
        uri: 'https://test.uri/',
      } ];

      const addUrlSpy = jest.spyOn(client, 'addUrl');
      const setThingSpy = jest.spyOn(client, 'setThing');

      const result = await service.addIssuers(webId, newIssuers);
      expect(result).toEqual(newIssuers);
      expect(addUrlSpy).toHaveBeenCalledTimes(newIssuers.length);
      expect(setThingSpy).toHaveBeenCalledTimes(1);
      expect(client.saveSolidDatasetAt).toHaveBeenCalledTimes(1);

    });

  });

  describe('getSources', () => {

    const source: Source = {
      uri: 'https://source.example.com/id',
      icon: 'https://source.example.com/favicon.ico',
      description: 'Example',
      type: 'solid',
      configuration: {},
    };
  

    it('should throw when no sources in WebID', async () => {

      service['getProfileThing'] = jest.fn().mockResolvedValue(webId);
      (client.getUrlAll as any) = jest.fn().mockReturnValue([]);

      await expect(service.getSources(webId)).rejects.toThrow('No sources for WebID:');

    });
    


    it('should return list of sources', async () => {

      service['getProfileThing'] = jest.fn().mockResolvedValue(profileThing);
      (client.getUrlAll as any) = jest.fn().mockReturnValue([ source.uri ]);

      await expect(service.getSources(webId)).resolves.toEqual([
        source,
      ]);

    });

    it('should return list of sources (uri no trailing slash)', async () => {

      service['getProfileThing'] = jest.fn().mockResolvedValue(profileThing);
      service['validateIssuer'] = jest.fn().mockResolvedValue(true);
      (client.getUrlAll as any) = jest.fn().mockReturnValue([ source.uri.replace(/\/$/, '') ]);

      await expect(service.getSources(webId)).resolves.toEqual([
        source,
      ]);

    });

    it('should return list of sources (host <= 2 parts)', async () => {

      service['getProfileThing'] = jest.fn().mockResolvedValue(profileThing);
      service['validateIssuer'] = jest.fn().mockResolvedValue(true);
      (client.getUrlAll as any) = jest.fn().mockReturnValue([ 'https://src.com/' ]);

      await expect(service.getSources(webId)).resolves.toEqual([
        {
          'description': 'Src',
          'icon': 'https://src.com/favicon.ico',
          'uri': 'https://src.com/',
          type: 'solid',
          configuration: {},
        },
      ]);

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

    it('should return valid profile when found (document does not contain all triples)', async () => {

      (client.getSolidDataset as any) = jest.fn(async () => validProfileDataset);
      (client.getThing as any) = jest.fn(() => validProfileThing);
      (client.getStringNoLocale as any) = jest.fn(() => null);
      (client.getStringWithLocale as any) = jest.fn(() => null);
      (client.getUrl as any) = jest.fn(() => null);

      const profile = await service.getProfile(webId);

      expect(profile).toEqual(expect.objectContaining({
        name: '',
        uri: webId,
        alternateName: undefined,
        description: undefined,
        website: undefined,
        logo: undefined,
        email: undefined,
        telephone: undefined,
      }));

    });

  });

  describe('getStorages', () => {

    it('should return correct values', async () => {

      // eslint-disable-next-line @typescript-eslint/dot-notation
      service['getProfileThing'] = jest.fn(async () => profileThing);
      (client.getUrlAll as any) = jest.fn().mockResolvedValue([  storage ]);

      const result = await service.getStorages(webId);
      expect(result.length).toEqual(1);
      expect(result).toContain(storage);

    });

  });

  describe('getDefaultSession', () => {

    it('should call getDefaultSession from SDK', () => {

      (getDefaultSession as any) = jest.fn(async () => ({}));
      service.getDefaultSession();
      expect(client.getDefaultSession).toHaveBeenCalledTimes(1);

    });

  });

  describe('getProfileDataset', () => {

    it('should error when fetching dataset fails', async () => {

      (client.getSolidDataset as any) = jest.fn(() => { throw new Error(); });

      await expect(service['getProfileDataset']('https://web.id/alice')).rejects.toThrow(`No profile for WebId: `);

    });

    it('should error when no dataset was found', async () => {

      (client.getSolidDataset as any) = jest.fn(() => undefined);

      await expect(service['getProfileDataset']('https://web.id/alice')).rejects.toThrow(`Could not read profile for WebId: `);

    });

    it('should return profile dataset when successful', async () => {

      (client.getSolidDataset as any) = jest.fn(() => 'profile dataset');

      await expect(service['getProfileDataset']('https://web.id/alice')).resolves.toEqual('profile dataset');

    });

  });

  describe('getProfileThing', () => {

    it('should error when webid is undefined', async () => {

      await expect(service['getProfileThing'](undefined as unknown as any)).rejects.toThrow(`WebId must be defined.`);

    });

    it('should error when webid is an invalid URL', async () => {

      await expect(service['getProfileThing']('invalid.url')).rejects.toThrow(`Invalid WebId: `);

    });

    it('should throw when no profile thing was found', async () => {

      (service['getProfileDataset'] as any) = jest.fn(async () => 'profile dataset');
      (client.getThing as any) = jest.fn(() => undefined);

      await expect(service['getProfileThing']('https://web.id/alice')).rejects.toThrow(`No profile info for WebId: `);

    });

    it('should return the profile Thing when successful', async () => {

      (service['getProfileDataset'] as any) = jest.fn(async () => 'profile dataset');
      (client.getThing as any) = jest.fn(() => 'profile thing');

      await expect(service['getProfileThing']('https://web.id/alice')).resolves.toEqual('profile thing');

    });

  });

});
