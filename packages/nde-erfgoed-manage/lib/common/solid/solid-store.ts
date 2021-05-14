import { Thing, getUrl, getSolidDataset, getThing, getThingAll } from '@digita-ai/nde-erfgoed-client';

import { Resource, Store } from '@digita-ai/nde-erfgoed-core';

export class SolidStore<T extends Resource> implements Store<T> {

  all(): Promise<T[]> {

    throw new Error('Method not implemented.');

  }
  delete(resource: T): Promise<T> {

    throw new Error('Method not implemented.');

  }
  save(resource: T): Promise<T> {

    throw new Error('Method not implemented.');

  }

  // todo move this to abstract SolidStore
  /**
   * Returns the instance URI of a type registration for a given RDF class
   *
   * @param webId The WebID of the Solid pod
   * @param forClass The forClass value of the type registration
   */
  async getInstanceForClass(webId: string, forClass: string): Promise<string> {

    const profileDataset = await getSolidDataset(webId);
    const profile = getThing(profileDataset, webId);

    // all collections are publicly accessible
    const publicTypeIndexDataset = await getSolidDataset(getUrl(profile, 'http://www.w3.org/ns/solid/terms#publicTypeIndex'));

    const catalogTypeRegistration = getThingAll(publicTypeIndexDataset).find((typeIndex: Thing) =>
      getUrl(typeIndex, 'http://www.w3.org/ns/solid/terms#forClass') === forClass);

    // todo create catalog type registration when not present
    if (!catalogTypeRegistration) {

      throw new Error('no type registration found');

    }

    return getUrl(catalogTypeRegistration, 'http://www.w3.org/ns/solid/terms#instance');

  }

}
