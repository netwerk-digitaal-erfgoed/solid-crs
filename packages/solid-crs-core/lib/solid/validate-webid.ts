import { getSolidDataset, getThing, getUrl } from '@digita-ai/inrupt-solid-client';

/**
 * Validates a WebID. Checks for necessary triples, and URL validity.
 *
 * @param webId The WebID to validate
 * @returns A list of errors if the WebID is invalid, or an empty list if the WebID is valid
 */
export const webIdValidator = async (webId: string): Promise<string[]> => {

  if (!webId) {

    return [ 'authenticate.error.invalid-webid.no-webid' ];

  }

  // Parse the user's WebID as a url.
  let webIdUrl: string;

  try {

    const hasProtocol = webId.startsWith('http://') || webId.startsWith('https://');

    webIdUrl = new URL(hasProtocol ? webId : `https://${webId}`).toString();

    await fetch(webIdUrl, { method: 'head' })
      .catch(async () => await fetch(webIdUrl.toString().replace('https://', 'http://'), { method: 'head' }));

  } catch {

    return [ 'authenticate.error.invalid-webid.invalid-url' ];

  }

  let profileDataset;

  // Dereference the user's WebID to get the user's profile document.
  try {

    profileDataset = await getSolidDataset(webIdUrl);

  } catch(e) {

    return [ 'authenticate.error.invalid-webid.no-profile' ];

  }

  if(!profileDataset) {

    return [ 'authenticate.error.invalid-webid.no-profile' ];

  }

  // Parses the profile document.
  const profile = getThing(profileDataset, webIdUrl);

  if(!profile) {

    return [ 'authenticate.error.invalid-webid.no-profile' ];

  }

  // Gets the issuer from the user's profile.
  const issuer = getUrl(profile, 'http://www.w3.org/ns/solid/terms#oidcIssuer');

  // Throw an error if there's no OIDC Issuer registered in the user's profile.
  if(!issuer) {

    return [ 'authenticate.error.invalid-webid.no-oidc-registration' ];

  }

  // Check if the issuer is a valid OIDC provider.
  let openidConfigResponse;
  let openidConfig;
  let poweredByHeader;

  try{

    openidConfigResponse = await fetch(new URL('/.well-known/openid-configuration', issuer).toString());
    openidConfig = await openidConfigResponse.json();
    poweredByHeader = openidConfigResponse.headers.get('X-Powered-By');

  } catch(e) {

    return [ 'authenticate.error.invalid-webid.invalid-oidc-registration' ];

  }

  // Throw an error if the issuer is an invalid OIDC provider.
  if (
  // Inrupt.net isn't (fully) Solid OIDC-compliant, therefore we check its X-Powered-By header
    (openidConfig && openidConfig.solid_oidc_supported !== 'https://solidproject.org/TR/solid-oidc') && !poweredByHeader?.includes('solid')
  ) {

    return [ 'authenticate.error.invalid-webid.invalid-oidc-registration' ];

  }

  return [];

};
