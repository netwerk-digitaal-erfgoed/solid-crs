import { login, getSolidDataset, handleIncomingRedirect, getThing, logout, getStringNoLocale, addUrl, getDefaultSession, getUrlAll, saveSolidDatasetAt, setThing, SolidDataset, Thing } from '@netwerk-digitaal-erfgoed/solid-crs-client';
import { Session } from '@digita-ai/inrupt-solid-client';
import { Client, Issuer, Source, Profile } from '@digita-ai/inrupt-solid-service';
import { SolidService } from './solid.service';
import { SolidSession } from './solid-session';
import { SolidProfile } from './solid-profile';

/**
 * An implementation of the Solid service which uses Solid Client.
 */
export class SolidSDKService implements SolidService {

  public restorePreviousSession = true;

  /**
   * Instantiates a solid sdk service.
   */
  constructor (private client: Client) {

    if (client.clientSecret && !client.clientId) throw new Error('clientId must be set if clientSecret is set');

  }

  async validateIssuer(issuer: string): Promise<boolean> {

    let openidConfig;
    let poweredByHeader;

    try {

      const openidConfigResponse = await fetch(new URL('/.well-known/openid-configuration', issuer).toString());
      openidConfig = await openidConfigResponse.json();
      poweredByHeader = openidConfigResponse.headers.get('X-Powered-By');

    } catch(e) { return false; }

    if (
    // Inrupt.net isn't (fully) Solid OIDC-compliant, therefore we check its X-Powered-By header
      !openidConfig && (poweredByHeader?.includes('solid') || openidConfig.solid_oidc_supported !== 'https://solidproject.org/TR/solid-oidc')
    ) return false;

    return true;

  }

  /**
   * Retrieves the value of the oidcIssuer triple from a profile document
   * for a given WebID
   *
   * @param webId The WebID for which to retrieve the OIDC issuer
   */
  async getIssuer(webId: string): Promise<string> { return this.getIssuers(webId).then((issuers) => issuers[0].uri); }

  /**
   * Retrieves the value of the oidcIssuer triple from a profile document
   * for a given WebID
   *
   * @param webId The WebID for which to retrieve the OIDC issuers
   */
  async getIssuers(webId: string): Promise<Issuer[]> {

    const responseHead = await fetch(webId, { method: 'HEAD' });

    const poweredByHeader = responseHead.headers.get('X-Powered-By');

    const profile = await this.getProfileThing(webId);

    // Gets the issuers from the user's profile.
    const issuers: string[] = getUrlAll(profile, 'http://www.w3.org/ns/solid/terms#oidcIssuer');

    const host = new URL(webId).origin;

    if (poweredByHeader?.includes('solid') && !issuers.includes(host)) {

      issuers.push(host);

    }

    // Check if the issuers are valid OIDC providers.

    const validationResults = await Promise.all(issuers.map(this.validateIssuer));

    const validIssuers = issuers.filter((issuer, index) => validationResults[index]);

    if (!validIssuers || validIssuers.length === 0) { throw new Error(`No valid OIDC issuers for WebID: ${webId}`); }

    return Promise.all(validIssuers.map((iss) => {

      const url = new URL(iss).host.split('.');
      let description = (url.length > 2 ? url[1] : url[0]).split(':')[0];
      description = description.charAt(0).toUpperCase() + description.slice(1);

      const favicon = iss.endsWith('/') ? `${iss}favicon.ico` : `${iss}/favicon.ico`;

      return fetch(favicon).then((response) => {

        const icon = response.status === 200 ? favicon : 'https://www.donkey.bike/wp-content/uploads/2020/12/user-member-avatar-face-profile-icon-vector-22965342-300x300.jpg';

        return { uri: iss, icon, description };

      });

    }));

  }

  /**
   * Adds a new oidcIssuer to the given WebID profile
   *
   * @param webId The WebID for which to retrieve the OIDC issuers
   * @param issuers The issuers to add
   */
  async addIssuers(webId: string, issuers: Issuer[]): Promise<Issuer[]> {

    // update the profile with new issuers
    let profile = await this.getProfileThing(webId);
    let profileDataset = await this.getProfileDataset(webId);

    issuers.forEach((issuer) => {

      profile = addUrl(profile, 'http://www.w3.org/ns/solid/terms#oidcIssuer', issuer.uri);

    });

    // update and save the dataset
    profileDataset = setThing(profileDataset, profile);
    await saveSolidDatasetAt(webId, profileDataset);

    return issuers;

  }

  async getSources(webId: string): Promise<Source[]> {

    const profile = await this.getProfileThing(webId);

    // Gets the sources from the user's profile.
    const sources: string[] = getUrlAll(profile, 'http://www.w3.org/ns/solid/terms#account');

    if (!sources || sources.length === 0) { throw new Error(`No sources for WebID: ${webId}`); }

    return Promise.all(sources.map((source) => {

      const url = new URL(source);

      const origin = url.origin;

      const host = url.host.split('.');

      let description = (host.length > 2 ? host[1] : host[0]).split(':')[0];
      description = description.charAt(0).toUpperCase() + description.slice(1);

      const favicon = origin.endsWith('/') ? `${origin}favicon.ico` : `${origin}/favicon.ico`;

      return fetch(favicon).then((response) => {

        const icon = response.status === 200 ? favicon : 'https://www.donkey.bike/wp-content/uploads/2020/12/user-member-avatar-face-profile-icon-vector-22965342-300x300.jpg';

        return { uri: source, icon, description, type: 'solid', configuration: {} };

      });

    }));

  }

  /**
   * Handles the post-login logic, as well as the restoration
   * of sessions on page refreshes
   */
  async getSession(): Promise<SolidSession> {

    const session = await handleIncomingRedirect({ restorePreviousSession: this.restorePreviousSession });

    return session && session.isLoggedIn && session.webId
      ? { webId: session.webId } : Promise.reject();

  }

  /**
   * Redirects the user to their OIDC provider
   */
  async login(webId: string): Promise<void> {

    if (!webId) {

      throw new Error(`WebId should be set.: ${webId}`);

    }

    const issuer = await this.getIssuer(webId);

    if (!issuer) {

      throw new Error(`Issuer should be set.: ${issuer}`);

    }

    await login({
      oidcIssuer: issuer,
      redirectUrl: window.location.href,
      clientName: this.client.clientName,
      clientId: this.client.clientId,
      clientSecret: this.client.clientSecret,
    });

  }

  /**
   * Redirects the user to their OIDC provider
   */
  async loginWithIssuer(issuer: Issuer): Promise<void> {

    if (!issuer) {

      throw new Error(`Issuer should be set.: ${issuer}`);

    }

    await login({
      oidcIssuer: issuer.uri,
      redirectUrl: window.location.href,
      clientName: this.client.clientName,
      clientId: this.client.clientId,
      clientSecret: this.client.clientSecret,
    });

  }

  /**
   * Deauthenticates the user from their OIDC issuer
   */
  async logout(): Promise<void> {

    return await logout();

  }

  /**
   * Retrieves the profile for the given WebID.
   *
   * @param webId The WebID for which to retrieve the profile.
   */
  async getProfile(webId: string): Promise<SolidProfile> {

    const profile = await this.getProfileThing(webId);

    const name = getStringNoLocale(profile, 'http://xmlns.com/foaf/0.1/name') ?? '';

    return { uri: webId, name };

  }

  /**
   * Retrieves values for the http://www.w3.org/ns/pim/space#storage predicate for a given WebID.
   *
   * @param webId The WebID for which to retrieve the profile.
   */
  async getStorages(webId: string): Promise<string[]> {

    const profile = await this.getProfileThing(webId);

    return getUrlAll(profile, 'http://www.w3.org/ns/pim/space#storage');

  }

  getDefaultSession(): SolidSession {

    return getDefaultSession() as unknown as SolidSession;

  }

  private async getProfileDataset(webId: string): Promise<SolidDataset> {

    let profileDataset;

    // Dereference the user's WebID to get the user's profile document.
    try {

      profileDataset = await getSolidDataset(webId);

    } catch(e) {

      throw new Error(`No profile for WebId: ${webId}`);

    }

    if(!profileDataset) {

      throw new Error(`Could not read profile for WebId: ${webId}`);

    }

    return profileDataset;

  }

  private async getProfileThing(webId: string): Promise<Thing> {

    if (!webId) {

      throw new Error(`WebId must be defined.`);

    }

    // Parse the user's WebID as a url.
    try {

      new URL(webId);

    } catch {

      throw new Error(`Invalid WebId: ${webId}`);

    }

    const profileDataset = await this.getProfileDataset(webId);

    // Parses the profile document.
    const profile = getThing(profileDataset, webId);

    if(!profile) {

      throw new Error(`No profile info for WebId: ${webId}`);

    }

    return profile;

  }

}
