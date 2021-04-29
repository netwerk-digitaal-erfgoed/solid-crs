import { Observable, of } from 'rxjs';
import { Logger } from '../logging/logger';
import { SolidService } from './solid.service';

/**
 * A mock implementation of the Solid service.
 */
export class SolidMockService extends SolidService {

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
  validateWebId(webId: string): Observable<boolean> {
    this.logger.debug(SolidMockService.name, 'Validating WebID', webId);
    return of(true);
  }

  /**
   * Retrieves the value of the oidcIssuer triple from a profile document
   * for a given WebID
   *
   * @param webId The WebID for which to retrieve the OIDC issuer
   */
  getIssuer(webId: string): Observable<string> {
    this.logger.debug(SolidMockService.name, 'Retrieving issuer', webId);
    return of('issuer');
  }

  /**
   * Handles the post-login logic, as well as the restoration
   * of sessions on page refreshes
   */
  handleIncomingRedirect(): Observable<unknown> {
    this.logger.debug(SolidMockService.name, 'Trying to retrieve session');
    return of({ isLoggedIn: true });
  }

  /**
   * Redirects the user to their OIDC provider
   */
  login(): Observable<unknown> {
    this.logger.debug(SolidMockService.name, 'Loggin in user');
    return of(true);
  }

  /**
   * Deauthenticates the user from their OIDC issuer
   */
  logout(): Observable<unknown> {
    this.logger.debug(SolidMockService.name, 'Logging out user');
    return of(true);
  }
}
