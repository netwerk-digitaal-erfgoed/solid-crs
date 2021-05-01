import { ArgumentError } from '../errors/argument-error';
import { Logger } from '../logging/logger';
import { SolidSession } from './solid-session';
import { SolidService } from './solid.service';

/**
 * A mock implementation of the Solid service.
 */
export class SolidMockService extends SolidService {

  // TODO: replace with our own hosted css pods when available
  private profiles = [
    {
      webId: 'https://pod.inrupt.com/digitatestpod1/profile/card#me',
      issuer: 'https://broker.pod.inrupt.com/',
    },
    {
      webId: 'https://pod.inrupt.com/digitatestpod2/profile/card#me',
    },
    {
      webId: 'https://pod.inrupt.com/digitatestpod3/profile/card#me',
      issuer: 'https://google.com/',
    },
  ];

  /**
   * Instantiates a solid mock service.
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
    this.logger.debug(SolidMockService.name, 'Validating WebID', webId);

    if (!webId) {
      throw new ArgumentError('nde.features.authenticate.error.invalid-webid.no-webid', webId);
    }

    try {
      new URL(webId);
    } catch {
      throw new ArgumentError('nde.features.authenticate.error.invalid-webid.invalid-url', webId);
    }

    const issuer = await this.getIssuer(webId);

    if (!issuer) {
      throw new ArgumentError('nde.features.authenticate.error.invalid-webid.no-oidc-registration', issuer);
    }

    return this.profiles.find((profile) => profile.webId === webId) !== null;
  }

  /**
   * Retrieves the value of the oidcIssuer triple from a profile document
   * for a given WebID
   *
   * @param webId The WebID for which to retrieve the OIDC issuer
   */
  async getIssuer(webId: string): Promise<string> {
    this.logger.debug(SolidMockService.name, 'Retrieving issuer', webId);

    if (!webId) {
      throw new ArgumentError('nde.features.authenticate.error.invalid-webid.no-webid', webId);
    }

    if (!this.profiles) {
      throw new ArgumentError('Argument this.profiles should be set.', this.profiles);
    }

    return this.profiles.find((profile) => profile.webId === webId)?.issuer;
  }

  /**
   * Handles the post-login logic, as well as the restoration
   * of sessions on page refreshes
   */
  async getSession(): Promise<SolidSession> {
    this.logger.debug(SolidMockService.name, 'Trying to retrieve session');

    if (!this.profiles) {
      throw new ArgumentError('Argument this.profiles should be set.', this.profiles);
    }

    return null;
  }

  /**
   * Redirects the user to their OIDC provider
   */
  async login(webId: string): Promise<void> {
    this.logger.debug(SolidMockService.name, 'Logging in user');

    if (!webId) {
      throw new ArgumentError('nde.features.authenticate.error.invalid-webid.no-webid', webId);
    }

    const isWebIdValid = await this.validateWebId(webId);

    if (!isWebIdValid) {
      throw new ArgumentError('nde.root.alerts.error', isWebIdValid);
    }
  }

  /**
   * Deauthenticates the user from their OIDC issuer
   */
  async logout(): Promise<unknown> {
    this.logger.debug(SolidMockService.name, 'Logging out user');
    return true;
  }
}
