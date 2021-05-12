import { getUrl, getSolidDataset, getStringWithLocale, getThing, getThingAll, getUrlAll, removeThing, saveSolidDatasetAt, fetch, getDefaultSession, setThing, removeUrl, Thing, addUrl, addStringWithLocale, createThing } from '@digita-ai/nde-erfgoed-client';
import { Collection, CollectionStore } from '@digita-ai/nde-erfgoed-core';
import { v4 } from 'uuid';

/**
 * A store for collections.
 */
export class CollectionSolidStore implements CollectionStore {

  /**
   * Retrieves a list of collections for a given WebID
   *
   */
  async all(): Promise<Collection[]> {

    const webId = getDefaultSession().info.webId;

    // retrieve the catalog
    const catalogUri = await this.getInstanceForClass(webId, 'http://schema.org/DataCatalog');
    const catalogDataset = await getSolidDataset(catalogUri);
    const catalog = getThing(catalogDataset, catalogUri);

    // get datasets (=== collections) in this catalog
    const collectionUris = getUrlAll(catalog, 'http://schema.org/dataset');

    return await Promise.all(collectionUris.map(async (collectionUri) => await this.getCollection(collectionUri)));

  }

  /**
   * Deletes a single Collection from a pod
   *
   * @param resource The Collection to delete
   */
  async delete(collection: Collection): Promise<Collection> {

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

    return collection;

  }

  /**
   * Stores a single Collection and its distribution to a pod
   *
   * @param resource The Collection to save
   */
  async save(collection: Collection): Promise<Collection> {

    // for creating new collection

    const collectionUri = collection.uri || `http://localhost:3000/leapeeters/heritage-collections/catalog#collection-${v4()}`;
    const distributionUri = `http://localhost:3000/leapeeters/heritage-collections/catalog#distribution-${v4()}`;

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

    // save collection and distribution in dataset
    updatedDataset = setThing(updatedDataset, collectionThing);
    updatedDataset = setThing(updatedDataset, distributionThing);

    // replace existing dataset with updated
    await saveSolidDatasetAt(collectionUri, updatedDataset, { fetch });

    return { ...collection, uri: collectionUri };

  }

  /**
   * Retrieves a single Collection
   *
   * @param uri The URI of the Collection
   */
  async getCollection(uri: string): Promise<Collection> {

    // retrieve collection
    const dataset = await getSolidDataset(uri);
    const collectionThing = getThing(dataset, uri);

    // retrieve distribution for the collection objects location
    const distributionUri = getUrl(collectionThing, 'http://schema.org/distribution');
    const distributionThing = getThing(dataset, distributionUri);
    const objectsUri = getUrl(distributionThing, 'http://schema.org/contentUrl');

    return {
      uri,
      name: getStringWithLocale(collectionThing, 'http://schema.org/name', 'nl'),
      description: getStringWithLocale(collectionThing, 'http://schema.org/description', 'nl'),
      objectsUri,
    };

  }

  // todo move this to abstract SolidStore
  /**
   * Returns the instance URI of a type registration for a given RDF class
   *
   * @param webId The WebID of the Solid pod
   * @param forClass The forClass value of the type registration
   */
  private async getInstanceForClass(webId: string, forClass: string): Promise<string> {

    const profileDataset = await getSolidDataset(webId);
    const profile = getThing(profileDataset, webId);

    // all collections are publicly accessible
    const publicTypeIndexDataset = await getSolidDataset(getUrl(profile, 'http://www.w3.org/ns/solid/terms#publicTypeIndex'));

    const catalogTypeRegistration = getThingAll(publicTypeIndexDataset).find((typeIndex) =>
      getUrl(typeIndex, 'http://www.w3.org/ns/solid/terms#forClass') === forClass);

    // todo create catalog type registration when not present
    if (!catalogTypeRegistration) {

      throw new Error('no type registration found');

    }

    return getUrl(catalogTypeRegistration, 'http://www.w3.org/ns/solid/terms#instance');

  }

}
