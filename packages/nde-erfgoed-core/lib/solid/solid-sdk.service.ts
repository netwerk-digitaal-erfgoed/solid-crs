import { login, getSolidDataset, handleIncomingRedirect, getThing, getUrl } from '@digita-ai/nde-erfgoed-client';
import { ArgumentError } from '../errors/argument-error';
import { Logger } from '../logging/logger';
import { NotImplementedError } from '../errors/not-implemented-error';
import { SolidService } from './solid.service';
import { SolidSession } from './solid-session';

/**
 * An implementation of the Solid service which uses Solid Client.
 */
export class SolidSDKService extends SolidService {

  /**
   * Instantiates a solid sdk service.
   *
   * @param logger The logger used in the service.
   */
  constructor(private logger: Logger) {
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
      throw new ArgumentError('nde.features.authenticate.error.invalid-webid.no-webid', webId);
    }

    // Parse the user's WebID as a url.
    try {
      const webIdUrl = new URL(webId);
    } catch {
      throw new ArgumentError('nde.features.authenticate.error.invalid-webid.invalid-url', webId);
    }

    let profileDataset;

    // Dereference the user's WebID to get the user's profile document.
    try {
      profileDataset = await getSolidDataset(webId);
    } catch(e) {
      throw new ArgumentError('nde.features.authenticate.error.invalid-webid.no-profile', webId);
    }

    // Parses the profile document.
    const profile = getThing(profileDataset, webId);

    if(!profile) {
      throw new ArgumentError('nde.features.authenticate.error.invalid-webid.no-profile', webId);
    }

    // Gets the issuer from the user's profile.
    const issuer = getUrl(profile, 'http://www.w3.org/ns/solid/terms#oidcIssuer');

    // Throw an error if there's no OIDC Issuer registered in the user's profile.
    if(!issuer) {
      throw new ArgumentError('nde.features.authenticate.error.invalid-webid.no-oidc-registration', issuer);
    }

    // Check if the issuer is a valid OIDC provider.
    let openidConfigResponse;
    try{
      openidConfigResponse = await fetch(new URL('/.well-known/openid-configuration', issuer).toString());
    } catch(e) {
      throw new ArgumentError('nde.features.authenticate.error.invalid-webid.invalid-oidc-registration', openidConfigResponse);
    }
    const openidConfig = await openidConfigResponse.json();

    // Throw an error if the issuer is an invalid OIDC provider.
    if (
      !openidConfig
      // Inrupt.net isn't (fully) Solid OIDC-compliant
      // || openidConfig.solid_oidc_supported !== 'https://solidproject.org/TR/solid-oidc'
    ) {
      throw new ArgumentError('nde.features.authenticate.error.invalid-webid.invalid-oidc-registration', openidConfig);
    }
    return issuer;
  }

  /**
   * Handles the post-login logic, as well as the restoration
   * of sessions on page refreshes
   */
  async getSession(): Promise<SolidSession> {
    this.logger.debug(SolidSDKService.name, 'Trying to retrieve session');

    const session = await handleIncomingRedirect();

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
      clientName: 'Getting started app',
    });
  }

  /**
   * Deauthenticates the user from their OIDC issuer
   */
  async logout(): Promise<unknown> {
    this.logger.debug(SolidSDKService.name, 'Logging out user');

    throw new NotImplementedError();
  }
}
