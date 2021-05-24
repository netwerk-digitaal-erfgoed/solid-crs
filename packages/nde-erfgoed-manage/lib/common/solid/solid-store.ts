import { Thing, getUrl, getSolidDataset, getThing, getThingAll, createThing, addUrl, setThing, saveSolidDatasetAt, fetch } from '@digita-ai/nde-erfgoed-client';
import { ArgumentError, Resource, Store } from '@digita-ai/nde-erfgoed-core';
import { v4 } from 'uuid';

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
   *
   * @param webId The WebID of the Solid pod
   * @param forClass The forClass value of the type registration
   */
  async getInstanceForClass(webId: string, forClass: string): Promise<string> {

    if (!webId) {

      throw new ArgumentError('Argument webId should be set', webId);

    }

    if (!forClass) {

      throw new ArgumentError('Argument forClass should be set', forClass);

    }

    const profileDataset = await getSolidDataset(webId);
    const profile = getThing(profileDataset, webId);

    const publicTypeIndexDataset = await getSolidDataset(getUrl(profile, 'http://www.w3.org/ns/solid/terms#publicTypeIndex'));

    const typeRegistration = getThingAll(publicTypeIndexDataset).find((typeIndex: Thing) =>
      getUrl(typeIndex, 'http://www.w3.org/ns/solid/terms#forClass') === forClass);

    if (!typeRegistration) {

      return null;

    }

    return getUrl(typeRegistration, 'http://www.w3.org/ns/solid/terms#instance');

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
    const typeIndexUrl = getUrl(profile, 'http://www.w3.org/ns/solid/terms#publicTypeIndex');
    const storage = getUrl(profile, 'http://www.w3.org/ns/pim/space#storage');
    const instance =  new URL(location, storage).toString(); // https://leapeeters.be/ + /heritage-collections/catalog

    const publicTypeIndexDataset = await getSolidDataset(typeIndexUrl);

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

}
