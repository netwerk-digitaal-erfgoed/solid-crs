import { getUrl, getSolidDataset, getStringWithLocale, getThing, getUrlAll, removeThing, saveSolidDatasetAt, fetch, getDefaultSession, setThing, removeUrl, addUrl, addStringWithLocale, createThing, overwriteFile, deleteFile, asUrl } from '@digita-ai/nde-erfgoed-client';
import { Collection, CollectionStore, ArgumentError } from '@digita-ai/nde-erfgoed-core';
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
    const catalogUri = await this.getInstanceForClass(webId, 'http://schema.org/DataCatalog');

    if (!catalogUri) {

      throw new ArgumentError('Could not retrieve type registration',  { webId, class: 'http://schema.org/DataCatalog' });

    }

    const catalogDataset = await getSolidDataset(catalogUri);
    const catalog = getThing(catalogDataset, catalogUri);

    // get datasets (=== collections) in this catalog
    const collectionUris = getUrlAll(catalog, 'http://schema.org/dataset') as string[];

    return await Promise.all(collectionUris.map(async (collectionUri) => await this.getCollection(collectionUri)));

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
    const catalogDataset = await getSolidDataset(collection.uri);
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

    // for creating new collection

    const collectionUri = collection.uri || `http://localhost:3000/leapeeters/heritage-collections/catalog#collection-${v4()}`;
    const distributionUri = collection.distribution || `http://localhost:3000/leapeeters/heritage-collections/catalog#distribution-${v4()}`;
    const objectsUri = collection.objectsUri || `http://localhost:3000/leapeeters/heritage-objects/data-${v4()}`;

    // retrieve the catalog
    const catalogDataset = await getSolidDataset(collectionUri);
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

    // create an empty file at objectsUri, where the collection objects will be stored
    await overwriteFile(`${objectsUri}`, new Blob([], { type: 'text/turtle' }), { fetch });

    return { ...collection, uri: collectionUri, objectsUri, distribution: distributionUri };

  }

  /**
   * Retrieves a single Collection
   *
   * @param uri The URI of the Collection
   */
  async getCollection(uri: string): Promise<Collection> {

    if (!uri) {

      throw new ArgumentError('Argument uri should be set', uri);

    }

    // retrieve collection
    const dataset = await getSolidDataset(uri);
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

}
