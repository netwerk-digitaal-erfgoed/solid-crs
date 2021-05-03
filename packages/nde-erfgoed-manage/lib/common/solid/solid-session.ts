/**
 * Represents a session with a Solid identity provider.
 */
export interface SolidSession {
  /**
   * The WebID of the authenticated user.
   */
  webId: string;

  /**
   * The logout function of the session.
   */
  logout: () => Promise<void>;
}
