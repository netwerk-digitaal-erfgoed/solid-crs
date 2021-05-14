import { Thing, getUrl, getSolidDataset, getThing, getThingAll } from '@digita-ai/nde-erfgoed-client';

import { ArgumentError, Resource, Store } from '@digita-ai/nde-erfgoed-core';

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

      throw new ArgumentError('Argument forClass should be set', webId);

    }

    const profileDataset = await getSolidDataset(webId);
    const profile = getThing(profileDataset, webId);

    // all collections are publicly accessible
    const publicTypeIndexDataset = await getSolidDataset(getUrl(profile, 'http://www.w3.org/ns/solid/terms#publicTypeIndex'));

    const catalogTypeRegistration = getThingAll(publicTypeIndexDataset).find((typeIndex: Thing) =>
      getUrl(typeIndex, 'http://www.w3.org/ns/solid/terms#forClass') === forClass);

    // todo create catalog type registration when not present
    if (!catalogTypeRegistration) {

      throw new ArgumentError('No type registration found', catalogTypeRegistration);

    }

    return getUrl(catalogTypeRegistration, 'http://www.w3.org/ns/solid/terms#instance');

  }

}
