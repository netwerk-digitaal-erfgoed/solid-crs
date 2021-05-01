import { authn, client } from '@digita-ai/nde-erfgoed-client';
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
   * Makes sure the profile document of a WebID contains
   * the necessary triples for authentication, and whether they are correct
   *
   * @param webId The WebID to validate
   */
  async validateWebId(webId: string): Promise<boolean> {
    this.logger.debug(SolidSDKService.name, 'Validating WebID', webId);

    throw new NotImplementedError();
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

    try {
      const webIdUrl = new URL(webId);
    } catch {
      throw new ArgumentError('nde.features.authenticate.error.invalid-webid.invalid-url', webId);
    }

    const profileDataset = await client.getSolidDataset(webId).catch(() => {
      throw new ArgumentError('nde.features.authenticate.error.invalid-webid.no-profile', webId);
    });

    const profile = client.getThing(profileDataset, webId);

    const issuer = client.getStringNoLocale(profile, 'http://www.w3.org/ns/solid/terms#oidcIssuer');

    const openidConfig = await fetch(new URL('/.well-known/openid-configuration', webId).toString()).then((response) => response.json());

    if (openidConfig.solid_oidc_supported !== 'https://solidproject.org/TR/solid-oidc') {
      throw new ArgumentError('invalid openid config', openidConfig);
    }
    return issuer;
  }

  /**
   * Handles the post-login logic, as well as the restoration
   * of sessions on page refreshes
   */
  async getSession(): Promise<SolidSession> {
    this.logger.debug(SolidSDKService.name, 'Trying to retrieve session');

    const session = await authn.handleIncomingRedirect();

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

    await authn.login({
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
