import { Observable } from 'rxjs';

/**
 * Service for interacting with Solid pods
 */
export abstract class SolidService {

  /**
   * Makes sure the profile document of a WebID contains
   * the necessary triples for authentication, and whether they are correct
   *
   * @param webId The WebID to validate
   */
  public abstract validateWebId(webId: string): Observable<boolean>;

  /**
   * Retrieves the value of the oidcIssuer triple from a profile document
   * for a given WebID
   *
   * @param webId The WebID for which to retrieve the OIDC issuer
   */
  public abstract getIssuer(webId: string): Observable<string>;

  /**
   * Handles the post-login logic, as well as the restoration
   * of sessions on page refreshes
   */
  public abstract handleIncomingRedirect(): Observable<unknown>;

  /**
   * Redirects the user to their OIDC provider
   */
  public abstract login(): Observable<unknown>;

  /**
   * Deauthenticates the user from their OIDC issuer
   */
  public abstract logout(): Observable<unknown>;

}
