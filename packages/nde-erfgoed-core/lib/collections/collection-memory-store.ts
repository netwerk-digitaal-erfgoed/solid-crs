import { ArgumentError } from '../errors/argument-error';
import { MemoryStore } from '../stores/memory-store';
import { Collection } from './collection';
import { CollectionStore } from './collection-store';

export class CollectionMemoryStore extends MemoryStore<Collection> implements CollectionStore {

  /**
   * Instantiates a collection object memory store.
   *
   * @param resources An array of collection objects to initially populate the store.
   */
  constructor(resources: Collection[]) {

    super(resources);

  }

  async search(searchterm: string): Promise<Collection[]> {

    if (!searchterm) {

      throw new ArgumentError('Argument searchterm should be set.', searchterm);

    }

    const lowerCaseTerm = searchterm.toLowerCase();

    return this.resources.filter((resource) =>
      resource.name.toLowerCase().includes(lowerCaseTerm) ||
      resource.description.toLowerCase().includes(lowerCaseTerm));

  }

}
