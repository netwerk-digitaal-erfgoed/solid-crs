/**
 * The context of th authenticate feature.
 */
export interface AuthenticateContext {

  /**
   * The session with the oidc issuer
   */
  // TODO replace any with Session type from inrupt sdk
  session: any;
}

export const initialAuthenticateContext: AuthenticateContext = {
  session: null,
};
