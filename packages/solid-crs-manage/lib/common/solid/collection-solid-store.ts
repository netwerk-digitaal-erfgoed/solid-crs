import { getUrl, getSolidDataset, getStringWithLocale, getThing, getUrlAll, removeThing, saveSolidDatasetAt, fetch, getDefaultSession, setThing, removeUrl, addUrl, addStringWithLocale, createThing, overwriteFile, deleteFile, asUrl, getStringNoLocale } from '@netwerk-digitaal-erfgoed/solid-crs-client';
import { Collection, CollectionStore, ArgumentError, fulltextMatch } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { v4 } from 'uuid';
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

    const webId = getDefaultSession()?.info?.webId;

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

        await this.createCatalog(catalogUri);

        return await getSolidDataset(catalogUri, { fetch });

      }
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

    if (!collection) {

      throw new ArgumentError('Argument collection should be set', collection);

    }

    // retrieve the catalog
    const catalogDataset = await getSolidDataset(collection.uri, { fetch });
    const catalogThing = getThing(catalogDataset, collection.uri.split('#')[0]);

    // remove the collection reference from catalog
    const updatedCatalog = removeUrl(catalogThing, 'http://schema.org/dataset', collection.uri);
    let updatedDataset = setThing(catalogDataset, updatedCatalog);

    // remove the collection and distribution from the dataset
    updatedDataset = removeThing(updatedDataset, collection.uri);
    const collectionThing = getThing(catalogDataset, collection.uri);
    const distributionUri = getUrl(collectionThing, 'http://schema.org/distribution');
    updatedDataset = removeThing(updatedDataset, distributionUri);

    // replace existing dataset with updated
    await saveSolidDatasetAt(collection.uri, updatedDataset, { fetch });

    // delete collection objects file
    await deleteFile(collection.objectsUri, { fetch });

    return collection;

  }

  /**
   * Stores a single Collection and its distribution to a pod
   *
   * @param resource The Collection to save
   */
  async save(collection: Collection): Promise<Collection> {

    if (!collection) {

      throw new ArgumentError('Argument collection should be set', collection);

    }

    // retrieve base urls for storage and catalogs (https://leapeeters.nl/ or https://leapeeters.nl/catalog)
    const webId = getDefaultSession()?.info?.webId;
    const catalogUri = await this.getInstanceForClass(webId, 'http://schema.org/DataCatalog');
    const profileDataset = await getSolidDataset(webId);
    const profile = getThing(profileDataset, webId);
    const storage = getUrl(profile, 'http://www.w3.org/ns/pim/space#storage');

    // uris for creating new collection
    const collectionUri = collection.uri || new URL(`#collection-${v4()}`, catalogUri).toString();
    const distributionUri = collection.distribution || new URL(`#distribution-${v4()}`, catalogUri).toString();
    const objectsUri = collection.objectsUri || new URL(`heritage-objects/data-${v4()}`, storage).toString();

    // retrieve the catalog
    const catalogDataset = await getSolidDataset(collectionUri, { fetch });
    const catalogThing = getThing(catalogDataset, collectionUri.split('#')[0]);

    // add collection to catalog
    const updatedCatalogThing = addUrl(catalogThing, 'http://schema.org/dataset', collectionUri);
    let updatedDataset = setThing(catalogDataset, updatedCatalogThing);
    // create collection Thing from our Collection model
    let collectionThing = createThing({ url: collectionUri });
    collectionThing = addUrl(collectionThing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Dataset');
    collectionThing = addStringWithLocale(collectionThing, 'http://schema.org/name', collection.name, 'nl');
    collectionThing = addStringWithLocale(collectionThing, 'http://schema.org/description', collection.description, 'nl');
    collectionThing = addUrl(collectionThing, 'http://schema.org/distribution', distributionUri);

    // create empty distribution
    let distributionThing = createThing({ url: distributionUri });
    distributionThing = addUrl(distributionThing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/DataDownload');
    distributionThing = addUrl(distributionThing, 'http://schema.org/contentUrl', objectsUri);

    // save collection and distribution in dataset
    updatedDataset = setThing(updatedDataset, collectionThing);
    updatedDataset = setThing(updatedDataset, distributionThing);

    // replace existing dataset with updated
    await saveSolidDatasetAt(collectionUri, updatedDataset, { fetch });

    const result = await fetch(objectsUri, { method: 'head' });

    if (!result.ok) {

      // create an empty file at objectsUri, where the collection objects will be stored
      await overwriteFile(`${objectsUri}`, new Blob([], { type: 'text/turtle' }), { fetch });

    }

    return { ...collection, uri: collectionUri, objectsUri, distribution: distributionUri };

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
   * Creates an initial DataCatalog for storing collections
   *
   * @param uri Where the catalog should be saved
   */
  async createCatalog(uri: string): Promise<void> {

    const webId = getDefaultSession()?.info?.webId;

    const profileDataset = await getSolidDataset(webId);
    const profile = getThing(profileDataset, webId);

    // fall back on foaf:name value if schema:name is missing
    const name = getStringWithLocale(profile, 'http://schema.org/name', 'nl') ||
      getStringNoLocale(profile, 'http://xmlns.com/foaf/0.1/name') ;

    await overwriteFile(`${uri}`, new Blob([ `
    @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
    @prefix schema: <http://schema.org/>.

    <>
      rdf:type schema:DataCatalog ;
      schema:name "Datacatalogus van ${name}"@nl ;
      schema:publisher <${webId}> .
    ` ], { type: 'text/turtle' }), { fetch });

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
