import { authn } from '@digita-ai/nde-erfgoed-client';
import { ArgumentError } from '../errors/argument-error';
import { Logger } from '../logging/logger';
import { NotImplementedError } from '../errors/not-implemented-error';
import { SolidService } from './solid.service';

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

    return 'https://broker.pod.inrupt.com';
  }

  /**
   * Handles the post-login logic, as well as the restoration
   * of sessions on page refreshes
   */
  async handleIncomingRedirect(): Promise<unknown> {
    this.logger.debug(SolidSDKService.name, 'Trying to retrieve session');

    throw new NotImplementedError();
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
