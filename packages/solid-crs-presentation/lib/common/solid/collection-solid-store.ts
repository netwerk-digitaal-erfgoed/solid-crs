import { getUrl, getSolidDataset, getStringWithLocale, getThing, getUrlAll, fetch } from '@netwerk-digitaal-erfgoed/solid-crs-client';
import { Collection, CollectionStore, ArgumentError, fulltextMatch, NotImplementedError } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { SolidStore } from './solid-store';

/**
 * A store for collections.
 */
export class CollectionSolidStore extends SolidStore<Collection> implements CollectionStore {

  /**
   * Retrieves a list of all collections
   *
   */
  async all(): Promise<Collection[]> {

    // const webId = getDefaultSession()?.info?.webId;
    const webId = 'http://localhost:3000/hetlageland/profile/card#me';

    if (!webId) {

      throw new ArgumentError('Argument WebID should be set',  webId);

    }

    // retrieve the catalog
    const catalogUri = await this.getInstanceForClass(webId, 'http://schema.org/DataCatalog') ||
      await this.saveInstanceForClass(webId, 'http://schema.org/DataCatalog', 'heritage-collections/catalog');

    if (!catalogUri) {

      throw new ArgumentError('Could not retrieve type registration',  { webId, class: 'http://schema.org/DataCatalog' });

    }

    const catalogDataset = await getSolidDataset(catalogUri, { fetch }).catch(
      async (err) => {

        throw new ArgumentError('Could not retrieve catalog', err);

      },
    );

    const catalog = getThing(catalogDataset, catalogUri);

    // get datasets (=== collections) in this catalog
    const collectionUris = getUrlAll(catalog, 'http://schema.org/dataset') as string[];

    return await Promise.all(collectionUris.map(async (collectionUri) => await this.get(collectionUri)));

  }

  /**
   * Deletes a single Collection from a pod
   *
   * @param resource The Collection to delete
   */
  async delete(collection: Collection): Promise<Collection> {

    throw new NotImplementedError();

  }

  /**
   * Stores a single Collection and its distribution to a pod
   *
   * @param resource The Collection to save
   */
  async save(collection: Collection): Promise<Collection> {

    throw new NotImplementedError();

  }

  /**
   * Retrieves a single Collection
   *
   * @param uri The URI of the Collection
   */
  async get(uri: string): Promise<Collection> {

    if (!uri) {

      throw new ArgumentError('Argument uri should be set', uri);

    }

    // retrieve collection
    const dataset = await getSolidDataset(uri, { fetch });
    const collectionThing = getThing(dataset, uri);

    if (!collectionThing) {

      return null;

    }

    // retrieve distribution for the collection objects location
    const distributionUri = getUrl(collectionThing, 'http://schema.org/distribution');
    const distributionThing = getThing(dataset, distributionUri);
    const objectsUri = getUrl(distributionThing, 'http://schema.org/contentUrl');

    return {
      uri,
      name: getStringWithLocale(collectionThing, 'http://schema.org/name', 'nl'),
      description: getStringWithLocale(collectionThing, 'http://schema.org/description', 'nl'),
      objectsUri,
      distribution: distributionUri,
    };

  }

  /**
   * Searches collections based on a search term.
   *
   * @param searchTerm The term to search for.
   * @param collections The collections to search through.
   * @returns The collections which match the search term.
   */
  async search(searchTerm: string, collections: Collection[]): Promise<Collection[]> {

    if (!searchTerm) {

      throw new ArgumentError('Argument searchTerm should be set.', searchTerm);

    }

    if (!collections) {

      throw new ArgumentError('Argument collections should be set.', collections);

    }

    return collections.filter((collection) => fulltextMatch(collection, searchTerm));

  }

}
