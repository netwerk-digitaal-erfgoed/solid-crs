import { Observable, of, throwError, timer } from 'rxjs';
import { delay, switchMap, tap } from 'rxjs/operators';
import { Logger } from '../logging/logger';
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
  validateWebId(webId: string): Observable<boolean> {
    this.logger.debug(SolidMockService.name, 'Validating WebID', webId);

    try {
      new URL(webId);
    } catch {
      return throwError(new Error('nde.root.alerts.error'));
    }

    return of(this.profiles.find((profile) => profile.webId === webId) && true).pipe(
      delay(1000),
    );
  }

  /**
   * Retrieves the value of the oidcIssuer triple from a profile document
   * for a given WebID
   *
   * @param webId The WebID for which to retrieve the OIDC issuer
   */
  getIssuer(webId: string): Observable<string> {
    this.logger.debug(SolidMockService.name, 'Retrieving issuer', webId);

    const issuer = this.profiles.find((profile) => profile.webId === webId)?.issuer;

    if (!issuer) {
      return throwError(new Error('nde.features.authenticate.error.invalid-webid.no-oidc-registration'));
    }

    return of(issuer).pipe(
      delay(1000),
    );
  }

  /**
   * Handles the post-login logic, as well as the restoration
   * of sessions on page refreshes
   */
  handleIncomingRedirect(): Observable<unknown> {
    this.logger.debug(SolidMockService.name, 'Trying to retrieve session');
    return of({ isLoggedIn: true, webId: this.profiles[0].webId }).pipe(
      delay(1000),
    );
  }

  /**
   * Redirects the user to their OIDC provider
   */
  login(webId: string): Observable<unknown> {
    this.logger.debug(SolidMockService.name, 'Logging in user');
    return this.validateWebId(webId).pipe(
      delay(1000),
      switchMap((valid) => valid ? of(true) : throwError(new Error('nde.root.alerts.error'))),
    );
  }

  /**
   * Deauthenticates the user from their OIDC issuer
   */
  logout(): Observable<unknown> {
    this.logger.debug(SolidMockService.name, 'Logging out user');
    return of(true).pipe(
      delay(1000),
    );
  }
}
