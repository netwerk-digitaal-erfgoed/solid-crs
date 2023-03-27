import { getDefaultSession } from '@digita-ai/inrupt-solid-client';
import { SolidSDKService } from '@digita-ai/inrupt-solid-service';
import { Thing, getUrl, getSolidDataset, getThing, getThingAll, createThing, addUrl, setThing, saveSolidDatasetAt, overwriteFile, access } from '@netwerk-digitaal-erfgoed/solid-crs-client';
import { v4 } from 'uuid';
import { ArgumentError } from '../errors/argument-error';
import { Resource } from '../stores/resource';
import { Store } from '../stores/store';

export class SolidStore<T extends Resource> implements Store<T> {

  constructor(protected solidService: SolidSDKService) { }

  async all(): Promise<T[]> {

    throw new Error('Method not implemented');

  }
  async delete(resource: T): Promise<T> {

    throw new Error('Method not implemented');

  }
  async save(resource: T): Promise<T> {

    throw new Error('Method not implemented.');

  }

  /**
   * Get a resource by its uri
   *
   * @param uri uri of the resource
   */
  async get(uri: string): Promise<T> {

    throw new Error('Method not implemented.');

  }

  /**
   * Returns the instance URI of a type registration for a given RDF class
   * or null when none was found
   *
   * @param webId The WebID of the Solid pod
   * @param forClass The forClass value of the type registration
   */
  async getInstanceForClass(webId: string, forClass: string): Promise<string | undefined> {

    if (!webId) {

      throw new ArgumentError('Argument webId should be set', webId);

    }

    if (!forClass) {

      throw new ArgumentError('Argument forClass should be set', forClass);

    }

    const profileDataset = await getSolidDataset(webId, { fetch: this.getSession().fetch });
    const profile = getThing(profileDataset, webId);

    if (!profile) {

      throw new ArgumentError('Could not find profile in dataset', profile);

    }

    // use value from profile if present
    // try storage + settings/publicTypeIndex.ttl as default
    const publicTypeIndexUrl = getUrl(profile, 'http://www.w3.org/ns/solid/terms#publicTypeIndex')
    ?? getUrl(profile, 'http://www.w3.org/ns/pim/space#storage') + 'settings/publicTypeIndex.ttl';

    if (!publicTypeIndexUrl) {

      return undefined;

    }

    const publicTypeIndexDataset = await getSolidDataset(publicTypeIndexUrl, { fetch: this.getSession().fetch });

    const typeRegistration = getThingAll(publicTypeIndexDataset).find((typeIndex: Thing) =>
      getUrl(typeIndex, 'http://www.w3.org/ns/solid/terms#forClass') === forClass);

    if (!typeRegistration) {

      return undefined;

    }

    return getUrl(typeRegistration, 'http://www.w3.org/ns/solid/terms#instance') ?? undefined;

  }

  /**
   * Saves a new type registration
   *
   * @param webId The WebID of the Solid pod
   * @param forClass The `forClass` value of the type registration
   * @param instance The `instance` value of the type registration
   * @returns The saved instance URL, when successful
   */
  async saveInstanceForClass(webId: string, forClass: string, location: string): Promise<string> {

    if (!webId) {

      throw new ArgumentError('Argument webId should be set', webId);

    }

    if (!forClass) {

      throw new ArgumentError('Argument forClass should be set', forClass);

    }

    if (!location) {

      throw new ArgumentError('Argument location should be set', location);

    }

    const profileDataset = await getSolidDataset(webId);
    const profile = getThing(profileDataset, webId);

    if (!profile) {

      throw new ArgumentError('Could not find profile in dataset', profile);

    }

    let typeIndexUrl = getUrl(profile, 'http://www.w3.org/ns/solid/terms#publicTypeIndex');

    if (!typeIndexUrl) {

      typeIndexUrl = (await this.createTypeIndexes(webId)).publicTypeIndex;

    }

    const storage = getUrl(profile, 'http://www.w3.org/ns/pim/space#storage');

    if (!storage) {

      throw new ArgumentError('Could not find storage in profile', storage);

    }

    const instance =  new URL(location, storage).toString(); // https://leapeeters.be/ + /heritage-collections/catalog

    const publicTypeIndexDataset = await getSolidDataset(typeIndexUrl, { fetch: this.getSession().fetch });

    const typeRegistration = getThingAll(publicTypeIndexDataset).find((typeIndex: Thing) =>
      getUrl(typeIndex, 'http://www.w3.org/ns/solid/terms#forClass') === forClass &&
      getUrl(typeIndex, 'http://www.w3.org/ns/solid/terms#instance') === instance);

    if (typeRegistration) {

      return instance;

    } else {

      let registration = createThing({ url: `${typeIndexUrl}#${v4()}` });
      registration = addUrl(registration, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://www.w3.org/ns/solid/terms#TypeRegistration');
      registration = addUrl(registration, 'http://www.w3.org/ns/solid/terms#forClass', forClass);
      registration = addUrl(registration, 'http://www.w3.org/ns/solid/terms#instance', instance);
      const updatedDataset = setThing(publicTypeIndexDataset, registration);

      await saveSolidDatasetAt(typeIndexUrl, updatedDataset, { fetch: this.getSession().fetch });

    }

    return instance;

  }

  async createTypeIndexes(webId: string): Promise<{ privateTypeIndex: string; publicTypeIndex: string }> {

    if (!webId) {

      throw new ArgumentError('Argument webId should be set', webId);

    }

    const profileDataset = await getSolidDataset(webId);
    const profile = getThing(profileDataset, webId);

    if (!profile) {

      throw new ArgumentError('Could not find profile in dataset', profile);

    }

    const storageRoot = getUrl(profile, 'http://www.w3.org/ns/pim/space#storage') ?? undefined;

    // assuming profile does not include the
    // http://www.w3.org/ns/pim/space#storage triple ->
    // guess the root of the user's pod from the webId
    const webIdSplit = webId.split('profile/card#me');

    if (!storageRoot && (!webId.endsWith('profile/card#me') || webIdSplit.length < 2)) {

      throw new ArgumentError('Could not create type indexes for webId', webId);

    }

    const privateTypeIndex = `${storageRoot ?? webIdSplit[0]}settings/privateTypeIndex.ttl`;
    const publicTypeIndex = `${storageRoot ?? webIdSplit[0]}settings/publicTypeIndex.ttl`;

    // create an empty type index files
    await overwriteFile(`${privateTypeIndex}`, new Blob([
      `@prefix solid: <http://www.w3.org/ns/solid/terms#>.
      <>
        a solid:TypeIndex ;
        a solid:UnlistedDocument.`,
    ], { type: 'text/turtle' }), { fetch: this.getSession().fetch });

    await overwriteFile(`${publicTypeIndex}`, new Blob([
      `@prefix solid: <http://www.w3.org/ns/solid/terms#>.
      <>
        a solid:TypeIndex ;
        a solid:ListedDocument.`,
    ], { type: 'text/turtle' }), { fetch: this.getSession().fetch });

    // add type index references to user profile
    let updatedProfile = addUrl(profile, 'http://www.w3.org/ns/solid/terms#privateTypeIndex', privateTypeIndex);
    updatedProfile = addUrl(updatedProfile, 'http://www.w3.org/ns/solid/terms#publicTypeIndex', publicTypeIndex);
    updatedProfile = addUrl(updatedProfile, 'http://www.w3.org/ns/pim/space#storage', webIdSplit[0]);

    const updatedDataset = setThing(profileDataset, updatedProfile);
    await saveSolidDatasetAt(webId, updatedDataset, { fetch: this.getSession().fetch });

    // make public type index public
    await this.setPublicAccess(publicTypeIndex);

    return { privateTypeIndex, publicTypeIndex };

  }

  /**
   * Sets public read access for a resource when not already set.
   * From https://docs.inrupt.com/developer-tools/javascript/client-libraries/tutorial/manage-access-control-list/ (made slight edits)
   *
   * @param resourceUri uri of the resource
   */
  async setPublicAccess(resourceUri: string): Promise<void> {

    const currentAccess = await access.getPublicAccess(
      resourceUri,
      { fetch: this.getSession().fetch }
    ).catch(async (err: { response: Response }) => {

      // create the .acl file if it doesn't exist
      if (err.response.status === 404) {

        const webId = this.solidService.getDefaultSession().info?.webId;
        const url = new URL(resourceUri);
        const target = url.origin + url.pathname;

        const body = `@prefix acl: <http://www.w3.org/ns/auth/acl#>.
        @prefix foaf: <http://xmlns.com/foaf/0.1/>.
    
        # The directory is readable by the public.
        <#public>
            a acl:Authorization;
            acl:agentClass foaf:Agent;
            acl:accessTo <${target.endsWith('/') ? './' : target}>;
            ${ target.endsWith('/') ? 'acl:default <./>;' : '' }
            acl:mode acl:Read.
    
        # The owner has full access to the entire directory.
        <#owner>
            a acl:Authorization;
            acl:agent <${webId}>;
            acl:accessTo <${target.endsWith('/') ? './' : target}>;
            ${ target.endsWith('/') ? 'acl:default <./>;' : '' }
            acl:mode acl:Read, acl:Write, acl:Control.`;

        await this.getSession().fetch(`${target}.acl`, {
          method: 'PUT',
          body,
          headers: { 'Content-Type': 'text/turtle' },
        });

        // try again
        return await access.getPublicAccess(
          resourceUri,
          { fetch: this.getSession().fetch }
        );

      } else {

        return Promise.reject(err);

      }

    });

    if (currentAccess && !currentAccess.read) {

      await access.setPublicAccess(
        resourceUri,
        { read: true },
        { fetch: this.getSession().fetch }
      );

    }

  }

  /**
   * @returns The current session
   */
  getSession(): ReturnType<typeof getDefaultSession> {

    return this.solidService.getDefaultSession();

  }

}
