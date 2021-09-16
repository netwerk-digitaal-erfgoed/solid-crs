import { login, getSolidDataset, handleIncomingRedirect, getThing, getUrl, logout, getStringNoLocale, getStringWithLocale } from '@netwerk-digitaal-erfgoed/solid-crs-client';
import { ArgumentError } from '../errors/argument-error';
import { Logger } from '../logging/logger';
import { SolidService } from './solid.service';
import { SolidSession } from './solid-session';
import { SolidProfile } from './solid-profile';

/**
 * An implementation of the Solid service which uses Solid Client.
 */
export class SolidSDKService extends SolidService {

  /**
   * Instantiates a solid sdk service.
   *
   * @param logger The logger used in the service.
   */
  constructor(
    private logger: Logger,
    private clientName = 'Solid CRS',
  ) {

    super();

  }

  /**
   * Retrieves the value of the oidcIssuer triple from a profile document
   * for a given WebID
   *
   * @param webId The WebID for which to retrieve the OIDC issuer
   */
  async getIssuer(webId: string): Promise<string> {

    this.logger.debug(SolidSDKService.name, 'Retrieving issuer', webId);

    if (!webId) {

      throw new ArgumentError('authenticate.error.invalid-webid.no-webid', webId);

    }

    // Parse the user's WebID as a url.
    let webIdUrl: string;

    try {

      const hasProtocol = webId.startsWith('http://') || webId.startsWith('https://');

      webIdUrl = new URL(hasProtocol ? webId : `https://${webId}`).toString();

      await fetch(webIdUrl, { method: 'head' })
        .catch(async () => await fetch(webIdUrl.toString().replace('https://', 'http://'), { method: 'head' }));

    } catch {

      throw new ArgumentError('authenticate.error.invalid-webid.invalid-url', webId);

    }

    let profileDataset;

    // Dereference the user's WebID to get the user's profile document.
    try {

      profileDataset = await getSolidDataset(webIdUrl);

    } catch(e) {

      throw new ArgumentError('authenticate.error.invalid-webid.no-profile', webIdUrl);

    }

    if(!profileDataset) {

      throw new ArgumentError('authenticate.error.invalid-webid.no-profile', webIdUrl);

    }

    // Parses the profile document.
    const profile = getThing(profileDataset, webIdUrl);

    if(!profile) {

      throw new ArgumentError('authenticate.error.invalid-webid.no-profile', webIdUrl);

    }

    // Gets the issuer from the user's profile.
    const issuer = getUrl(profile, 'http://www.w3.org/ns/solid/terms#oidcIssuer');

    // Throw an error if there's no OIDC Issuer registered in the user's profile.
    if(!issuer) {

      throw new ArgumentError('authenticate.error.invalid-webid.no-oidc-registration', issuer);

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

      throw new ArgumentError('authenticate.error.invalid-webid.invalid-oidc-registration', issuer);

    }

    // Throw an error if the issuer is an invalid OIDC provider.
    if (
      // Inrupt.net isn't (fully) Solid OIDC-compliant, therefore we check its X-Powered-By header
      (openidConfig && openidConfig.solid_oidc_supported !== 'https://solidproject.org/TR/solid-oidc') && !poweredByHeader?.includes('solid')
    ) {

      throw new ArgumentError('authenticate.error.invalid-webid.invalid-oidc-registration', openidConfig);

    }

    return issuer;

  }

  /**
   * Handles the post-login logic, as well as the restoration
   * of sessions on page refreshes
   */
  async getSession(): Promise<SolidSession> {

    this.logger.debug(SolidSDKService.name, 'Trying to retrieve session');

    const session = await handleIncomingRedirect({ restorePreviousSession: true });

    return session && session.isLoggedIn ? { webId: session.webId } : null;

  }

  /**
   * Redirects the user to their OIDC provider
   */
  async login(webId: string): Promise<void> {

    this.logger.debug(SolidSDKService.name, 'Logging in user');

    if (!webId) {

      throw new ArgumentError('Argument webId should be set.', webId);

    }

    const issuer = await this.getIssuer(webId);

    if (!issuer) {

      throw new ArgumentError('Argument issuer should be set.', issuer);

    }

    await login({
      oidcIssuer: issuer,
      redirectUrl: window.location.href,
      clientName: this.clientName,
    });

  }

  /**
   * Deauthenticates the user from their OIDC issuer
   */
  async logout(): Promise<void> {

    this.logger.debug(SolidSDKService.name, 'Logging out user');

    return await logout();

  }

  /**
   * Retrieves the profile for the given WebID.
   *
   * @param webId The WebID for which to retrieve the profile.
   */
  async getProfile(webId: string): Promise<SolidProfile> {

    if (!webId) {

      throw new ArgumentError('authenticate.error.invalid-webid.no-webid', webId);

    }

    // Parse the user's WebID as a url.
    try {

      const webIdUrl = new URL(webId);

    } catch {

      throw new ArgumentError('authenticate.error.invalid-webid.invalid-url', webId);

    }

    let profileDataset;

    // Dereference the user's WebID to get the user's profile document.
    try {

      profileDataset = await getSolidDataset(webId);

    } catch(e) {

      throw new ArgumentError('authenticate.error.invalid-webid.no-profile', webId);

    }

    if(!profileDataset) {

      throw new ArgumentError('authenticate.error.invalid-webid.no-profile', webId);

    }

    // Parses the profile document.
    const profile = getThing(profileDataset, webId);

    if(!profile) {

      throw new ArgumentError('authenticate.error.invalid-webid.no-profile', webId);

    }

    const name = getStringNoLocale(profile, 'http://schema.org/name') || getStringNoLocale(profile, 'http://xmlns.com/foaf/0.1/name') || undefined;
    const alternateName = getStringNoLocale(profile, 'http://schema.org/alternateName') || undefined;
    const description = getStringWithLocale(profile, 'http://schema.org/description', 'nl') || getStringNoLocale(profile, 'http://schema.org/description') || undefined;
    const website = getUrl(profile, 'http://schema.org/url') || undefined;
    const logo = getUrl(profile, 'http://schema.org/logo') || undefined;
    const contactPoint = getUrl(profile, 'http://schema.org/contactPoint');

    let email;
    let telephone;

    if (contactPoint) {

      const contactPointThing = getThing(profileDataset, contactPoint);
      email = getStringNoLocale(contactPointThing, 'http://schema.org/email') || undefined;
      telephone = getStringNoLocale(contactPointThing, 'http://schema.org/telephone') || undefined;

    }

    return { uri: webId, name, alternateName, description, website, logo, email, telephone };

  }

}
