import { SolidSDKService } from './solid-sdk.service';

/**
 * Manage creation and reading of inboxes
 */
export class InboxService  {

  constructor(private solidService: SolidSDKService) { }

  /**
   * Creates a new inbox container in a given container
   * with correct access control.
   *
   * @param containerUri The parent container in which to create the inbox
   *
   * @returns The URI of the inbox container
   */
  async createInbox(containerUri: string, inboxName = 'inbox'): Promise<string> {

    try {

      new URL(containerUri);

    } catch {

      throw new Error('Invalid container URI');

    }

    // add slash to the end, together with the inbox name
    const inboxUri = `${containerUri.endsWith('/') ? containerUri : `${containerUri}/`}${inboxName}/`;

    const aclBody = `@prefix  acl:   <http://www.w3.org/ns/auth/acl#>.
@prefix  foaf:  <http://xmlns.com/foaf/0.1/>.

<#public>
    a               acl:Authorization;
    acl:agentClass  foaf:Agent;
    acl:accessTo    <./>;
    acl:mode        acl:Read,
                    acl:Append.

<#owner>
    a             acl:Authorization;
    acl:agent     <${this.solidService.getDefaultSession().info.webId}>;
    acl:accessTo  <./>;
    acl:default   <./>;
    acl:mode      acl:Read,
                  acl:Write,
                  acl:Append,
                  acl:Delete,
                  acl:Control.`;

    await this.solidService.getDefaultSession().fetch(`${inboxUri}.acl`, {
      method: 'PUT',
      headers: { 'Content-Type': 'text/turtle' },
      body: aclBody,
    });

    return inboxUri;

  }

}
