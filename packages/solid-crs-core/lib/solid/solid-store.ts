import { Thing, getUrl, getSolidDataset, getThing, getThingAll, createThing, addUrl, setThing, saveSolidDatasetAt, fetch, overwriteFile, access, getResourceAcl, getSolidDatasetWithAcl, hasResourceAcl, saveAclFor, createAclFromFallbackAcl, hasAccessibleAcl, hasFallbackAcl, setPublicResourceAccess, getPublicAccess } from '@netwerk-digitaal-erfgoed/solid-crs-client';
import { v4 } from 'uuid';
import { ArgumentError } from '../errors/argument-error';
import { Resource } from '../stores/resource';
import { Store } from '../stores/store';

export class SolidStore<T extends Resource> implements Store<T> {

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

    const profileDataset = await getSolidDataset(webId, { fetch });
    const profile = getThing(profileDataset, webId);

    if (!profile) {

      throw new ArgumentError('Could not find profile in dataset', profile);

    }

    const publicTypeIndexUrl = getUrl(profile, 'http://www.w3.org/ns/solid/terms#publicTypeIndex');

    if (!publicTypeIndexUrl) {

      return undefined;

    }

    const publicTypeIndexDataset = await getSolidDataset(publicTypeIndexUrl, { fetch });

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

    const publicTypeIndexDataset = await getSolidDataset(typeIndexUrl, { fetch });

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

      await saveSolidDatasetAt(typeIndexUrl, updatedDataset, { fetch });

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

    // assuming profile does not include the
    // http://www.w3.org/ns/pim/space#storage triple ->
    // guess the root of the user's pod from the webId
    const webIdSplit = webId.split('profile/card#me');

    if (!webId.endsWith('profile/card#me') || webIdSplit.length < 2) {

      throw new ArgumentError('Could not create type indexes for webId', webId);

    }

    const privateTypeIndex = `${webIdSplit[0]}settings/privateTypeIndex.ttl`;
    const publicTypeIndex = `${webIdSplit[0]}settings/publicTypeIndex.ttl`;

    // create an empty type index files
    await overwriteFile(`${privateTypeIndex}`, new Blob([
      `@prefix solid: <http://www.w3.org/ns/solid/terms#>.
      <>
        a solid:TypeIndex ;
        a solid:UnlistedDocument.`,
    ], { type: 'text/turtle' }), { fetch });

    await overwriteFile(`${publicTypeIndex}`, new Blob([
      `@prefix solid: <http://www.w3.org/ns/solid/terms#>.
      <>
        a solid:TypeIndex ;
        a solid:ListedDocument.`,
    ], { type: 'text/turtle' }), { fetch });

    // add type index references to user profile
    let updatedProfile = addUrl(profile, 'http://www.w3.org/ns/solid/terms#privateTypeIndex', privateTypeIndex);
    updatedProfile = addUrl(updatedProfile, 'http://www.w3.org/ns/solid/terms#publicTypeIndex', publicTypeIndex);
    updatedProfile = addUrl(updatedProfile, 'http://www.w3.org/ns/pim/space#storage', webIdSplit[0]);

    const updatedDataset = setThing(profileDataset, updatedProfile);
    await saveSolidDatasetAt(webId, updatedDataset, { fetch });

    // make public type index public
    await access.setPublicAccess(
      publicTypeIndex,
      { read: true },
      { fetch }
    );

    return { privateTypeIndex, publicTypeIndex };

  }

  /**
   * Sets public read access for a resource when not already set.
   * From https://docs.inrupt.com/developer-tools/javascript/client-libraries/tutorial/manage-access-control-list/ (made slight edits)
   *
   * @param resourceUri uri of the resource
   */
  async setPublicAccess(resourceUri: string): Promise<void> {

    // Fetch the SolidDataset and its associated ACLs, if available:
    const myDatasetWithAcl = await getSolidDatasetWithAcl(resourceUri, { fetch });
    // Obtain the SolidDataset's own ACL, if available,
    // or initialise a new one, if possible:
    let resourceAcl;

    if (!hasResourceAcl(myDatasetWithAcl)) {

      if (!hasAccessibleAcl(myDatasetWithAcl)) {

        throw new Error(
          'The current user does not have permission to change access rights to this Resource.'
        );

      }

      if (!hasFallbackAcl(myDatasetWithAcl)) {

        throw new Error(
          'The current user does not have permission to see who currently has access to this Resource.'
        );
        // Alternatively, initialise a new empty ACL as follows,
        // but be aware that if you do not give someone Control access,
        // **nobody will ever be able to change Access permissions in the future**:
        // resourceAcl = createAcl(myDatasetWithAcl);

      }

      resourceAcl = createAclFromFallbackAcl(myDatasetWithAcl);

    } else {

      resourceAcl = getResourceAcl(myDatasetWithAcl);

    }

    const currentAccess = getPublicAccess(myDatasetWithAcl);

    if (!currentAccess?.read) {

      // Give everyone Read access to the given Resource:

      const updatedAcl = setPublicResourceAccess(
        resourceAcl,
        { read: true, append: false, write: false, control: false },
      );

      // Now save the ACL:
      await saveAclFor(myDatasetWithAcl, updatedAcl, { fetch });

    }

  }

}
