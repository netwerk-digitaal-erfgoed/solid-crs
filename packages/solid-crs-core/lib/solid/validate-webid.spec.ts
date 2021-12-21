/* eslint-disable @typescript-eslint/no-explicit-any */
import * as client from '@digita-ai/inrupt-solid-client';
import fetchMock from 'jest-fetch-mock';
import { validateWebId } from './validate-webid';

describe('webIdValidator', () => {

  const validOpenIdConfig = JSON.stringify({ solid_oidc_supported: 'https://solidproject.org/TR/solid-oidc' });
  const validProfileDataset = {};
  const validProfileThing = {};

  beforeEach(() => {

    fetchMock.resetMocks();

  });

  it.each([
    [ null, validProfileDataset, validOpenIdConfig, 'authenticate.error.invalid-webid.no-webid' ],
    [ undefined, validProfileDataset, validOpenIdConfig, 'authenticate.error.invalid-webid.no-webid' ],
    [ 'invalid-url', validProfileDataset, validOpenIdConfig, 'authenticate.error.invalid-webid.invalid-url' ],
  ])('should return result when webId is %s', async (webId, profile, openId, message) => {

    (client.getSolidDataset as any) = jest.fn(async () => profile);

    fetchMock
      .mockRejectOnce() // fail https:// URL check
      .mockRejectOnce() // fail http:// URL check
      .once(openId);

    await expect(validateWebId(webId)).resolves.toEqual([ message ]);

  });

  it('should return result when webId is valid URL, but no profile', async () => {

    (client.getSolidDataset as any) = jest.fn(async () => null);

    fetchMock
      .once('') // pass https:// URL check
      .once(validOpenIdConfig);

    await expect(validateWebId('https://nde.nl/')).resolves.toEqual([ 'authenticate.error.invalid-webid.no-profile' ]);

  });

  it('should return result when getSolidDataset errors', async () => {

    const webId = 'https://pod.inrupt.com/digitatestpod/profile/card#me';
    (client.getSolidDataset as any) = jest.fn(async () => { throw Error(); });

    await expect(validateWebId(webId)).resolves.toEqual([ 'authenticate.error.invalid-webid.no-profile' ]);

  });

  it('should return result when unable to set dataset', async () => {

    const webId = 'https://pod.inrupt.com/digitatestpod/profile/card#me';

    (client.getSolidDataset as any) = jest.fn(async () => { throw Error(); });

    await expect(validateWebId(webId)).resolves.toEqual([ 'authenticate.error.invalid-webid.no-profile' ]);

  });

  it('should return result when profile is null', async () => {

    const webId = 'https://pod.inrupt.com';

    (client.getSolidDataset as any) = jest.fn().mockReturnValueOnce(validProfileDataset);
    (client.getThing as any) = jest.fn().mockReturnValueOnce(null);

    await expect(validateWebId(webId)).resolves.toEqual([ 'authenticate.error.invalid-webid.no-profile' ]);

  });

  it('should return result when issuer is null', async () => {

    const webId = 'https://pod.inrupt.com';

    (client.getSolidDataset as any) = jest.fn().mockReturnValueOnce(validProfileDataset);
    (client.getThing as any) = jest.fn().mockReturnValueOnce(validProfileThing);
    (client.getUrl as any) = jest.fn().mockReturnValueOnce(null);

    await expect(validateWebId(webId)).resolves.toEqual([ 'authenticate.error.invalid-webid.no-oidc-registration' ]);

  });

  it('should return result when oidcIssuer openid config is invalid', async () => {

    const webId = 'https://pod.inrupt.com/digitatestpod/profile/card#me';
    (client.getSolidDataset as any) = jest.fn(async () => validProfileDataset);
    (client.getThing as any) = jest.fn(async () => validProfileThing);
    (client.getUrl as any) = jest.fn(() => 'https://google.com/');

    fetchMock.mockRejectOnce();

    await expect(validateWebId(webId)).resolves.toEqual([ 'authenticate.error.invalid-webid.invalid-oidc-registration' ]);

  });

  it('should return result when oidcIssuer response does not contain "X-Powered-By: solid" header', async () => {

    const webId = 'https://pod.inrupt.com/digitatestpod/profile/card#me';
    (client.getSolidDataset as any) = jest.fn(async () => validProfileDataset);
    (client.getThing as any) = jest.fn(async () => validProfileThing);
    (client.getUrl as any) = jest.fn(() => 'https://google.com/');

    fetchMock
      .once('') // pass https:// URL check
      .mockResponseOnce('{}', { status: 200 });

    await expect(validateWebId(webId)).resolves.toEqual([ 'authenticate.error.invalid-webid.invalid-oidc-registration' ]);

  });

  it('should return no results when openid response contains "X-Powered-By: solid" header', async () => {

    const webId = 'https://pod.inrupt.com/digitatestpod/profile/card#me';
    (client.getSolidDataset as any) = jest.fn(async () => validProfileDataset);
    (client.getThing as any) = jest.fn(async () => validProfileThing);
    (client.getUrl as any) = jest.fn(() => 'https://google.com/');

    fetchMock
      .once('') // pass https:// URL check
      .mockResponseOnce('{}', { status: 200, headers: { 'X-Powered-By': 'solid-server/5.6.6' } });

    await expect(validateWebId(webId)).resolves.toEqual([]);

  });

});
