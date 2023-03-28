import { getUrl, getSolidDataset, getStringWithLocale, getThing, getUrlAll, removeThing, saveSolidDatasetAt, setThing, removeUrl, addUrl, addStringWithLocale, createThing, overwriteFile, deleteFile, getStringNoLocale, addStringNoLocale } from '@netwerk-digitaal-erfgoed/solid-crs-client';
import { v4 } from 'uuid';
import { Collection } from '../collections/collection';
import { CollectionStore } from '../collections/collection-store';
import { ArgumentError } from '../errors/argument-error';
import { InboxService } from '../inbox/inbox.service';
import { fulltextMatch } from '../utils/fulltext-match';
import { SolidSDKService } from './solid-sdk.service';
import { SolidStore } from './solid-store';

/**
 * A store for collections.
 */
export class CollectionSolidStore extends SolidStore<Collection> implements CollectionStore {

  constructor(
    protected solidService: SolidSDKService,
    private inboxService: InboxService,
    public webId?: string,
  ) {

    super(solidService);

  }

  /**
   * Retrieves a list of all collections
   *
   */
  async all(): Promise<Collection[]> {

    const webId = this.webId || this.solidService.getDefaultSession()?.info?.webId;

    if (!webId) {

      throw new ArgumentError('Argument WebID should be set',  webId);

    }

    // retrieve the catalog
    const catalogUri = await this.getInstanceForClass(webId, 'http://schema.org/DataCatalog') ||
      await this.saveInstanceForClass(webId, 'http://schema.org/DataCatalog', 'heritage-collections/catalog');

    if (!catalogUri) {

      throw new ArgumentError('Could not retrieve type registration',  { webId, class: 'http://schema.org/DataCatalog' });

    }

    const catalogDataset = await getSolidDataset(catalogUri, { fetch: this.getSession().fetch }).catch(async () => {

      await this.createCatalog(catalogUri);

      return await getSolidDataset(catalogUri, { fetch: this.getSession().fetch });

    });

    const catalog = getThing(catalogDataset, catalogUri);

    if (!catalog) {

      throw new ArgumentError('Could not find catalog in dataset', catalog);

    }

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
    const catalogDataset = await getSolidDataset(collection.uri, { fetch: this.getSession().fetch });
    const catalogThing = getThing(catalogDataset, collection.uri.split('#')[0]);

    if (!catalogThing) {

      throw new ArgumentError('Could not find catalogThing in dataset', catalogThing);

    }

    // remove the collection reference from catalog
    const updatedCatalog = removeUrl(catalogThing, 'http://schema.org/dataset', collection.uri);
    let updatedDataset = setThing(catalogDataset, updatedCatalog);

    // remove the collection and distribution from the dataset
    updatedDataset = removeThing(updatedDataset, collection.uri);
    const collectionThing = getThing(catalogDataset, collection.uri);

    if (!collectionThing) {

      throw new ArgumentError('Could not find collectionThing in dataset', collectionThing);

    }

    const distributionUri = getUrl(collectionThing, 'http://schema.org/distribution');

    if (!distributionUri) {

      throw new ArgumentError('Could not find distributionUri in dataset', distributionUri);

    }

    updatedDataset = removeThing(updatedDataset, distributionUri);

    // replace existing dataset with updated
    await saveSolidDatasetAt(collection.uri, updatedDataset, { fetch: this.getSession().fetch });

    // delete collection objects file
    await deleteFile(collection.objectsUri, { fetch: this.getSession().fetch });

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
    const webId = this.solidService.getDefaultSession()?.info?.webId;

    if (!webId) {

      throw new ArgumentError('Not logged in', webId);

    }

    const catalogUri = await this.getInstanceForClass(webId, 'http://schema.org/DataCatalog');

    if (!catalogUri) {

      throw new ArgumentError('Could not find catalogUri', catalogUri);

    }

    const profileDataset = await getSolidDataset(webId);
    const profile = getThing(profileDataset, webId);

    if (!profile) {

      throw new ArgumentError('Could not find profile in dataset', profile);

    }

    const storage = getUrl(profile, 'http://www.w3.org/ns/pim/space#storage');

    if (!storage) {

      throw new ArgumentError('Could not find storage in dataset', storage);

    }

    // uris for creating new collection
    const collectionUri = collection.uri || new URL(`#collection-${v4()}`, catalogUri).toString();
    const distributionUri = collection.distribution || new URL(`#distribution-${v4()}`, catalogUri).toString();
    const objectsUri = collection.objectsUri || new URL(`heritage-objects/data-${v4()}`, storage).toString();

    // retrieve the catalog
    const catalogDataset = await getSolidDataset(catalogUri, { fetch: this.getSession().fetch });
    const catalogThing = getThing(catalogDataset, catalogUri);

    if (!catalogThing) {

      throw new ArgumentError('Could not find catalogThing in dataset', catalogThing);

    }

    // add collection to catalog
    const updatedCatalogThing = addUrl(catalogThing, 'http://schema.org/dataset', collectionUri);
    let updatedDataset = setThing(catalogDataset, updatedCatalogThing);
    // create collection Thing from our Collection model
    let collectionThing = createThing({ url: collectionUri });
    collectionThing = addUrl(collectionThing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Dataset');
    collectionThing = addStringWithLocale(collectionThing, 'http://schema.org/name', collection.name, 'nl');
    collectionThing = addStringWithLocale(collectionThing, 'http://schema.org/description', collection.description, 'nl');
    collectionThing = addUrl(collectionThing, 'http://schema.org/distribution', distributionUri);
    collectionThing = addUrl(collectionThing, 'http://schema.org/license', 'https://creativecommons.org/publicdomain/zero/1.0/deed.nl');
    collectionThing = addUrl(collectionThing, 'http://schema.org/publisher', collection.publisher ?? webId);

    const inboxUri = getUrl(catalogThing, 'http://www.w3.org/ns/ldp#inbox');

    if (!inboxUri) {

      throw new Error('Could not find inboxUri in catalog');

    }

    collectionThing = addUrl(collectionThing, 'http://www.w3.org/ns/ldp#inbox', inboxUri);

    // create empty distribution
    let distributionThing = createThing({ url: distributionUri });
    distributionThing = addUrl(distributionThing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/DataDownload');
    distributionThing = addUrl(distributionThing, 'http://schema.org/contentUrl', objectsUri);
    distributionThing = addStringNoLocale(distributionThing, 'http://schema.org/encodingFormat', 'text/turtle');

    // save collection and distribution in dataset
    updatedDataset = setThing(updatedDataset, collectionThing);
    updatedDataset = setThing(updatedDataset, distributionThing);

    // replace existing dataset with updated
    await saveSolidDatasetAt(catalogUri, updatedDataset, { fetch: this.getSession().fetch });
    // set public read access for collection
    await this.setPublicAccess(catalogUri);
    // set public read access for parent folder
    await this.setPublicAccess(`${new URL(catalogUri).origin}${new URL(catalogUri).pathname.split('/').slice(0, -1).join('/')}/`);

    const result = await this.getSession().fetch(objectsUri, { method: 'head' });

    if (!result.ok) {

      // create an empty file at objectsUri, where the collection objects will be stored
      await overwriteFile(`${objectsUri}`, new Blob([], { type: 'text/turtle' }), { fetch: this.getSession().fetch });
      // set public read access for this resource
      await this.setPublicAccess(objectsUri);

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
    const dataset = await getSolidDataset(uri, { fetch: this.getSession().fetch });
    const collectionThing = getThing(dataset, uri);

    if (!collectionThing) {

      throw new ArgumentError('Could not find collectionThing in dataset', collectionThing);

    }

    // retrieve distribution for the collection objects location
    const distributionUri = getUrl(collectionThing, 'http://schema.org/distribution');

    if (!distributionUri) {

      throw new ArgumentError('Could not find distributionUri in dataset', distributionUri);

    }

    const distributionThing = getThing(dataset, distributionUri);

    if (!distributionThing) {

      throw new ArgumentError('Could not find distributionThing in dataset', distributionThing);

    }

    const objectsUri = getUrl(distributionThing, 'http://schema.org/contentUrl');
    const name = getStringWithLocale(collectionThing, 'http://schema.org/name', 'nl');
    const description = getStringWithLocale(collectionThing, 'http://schema.org/description', 'nl');
    const inbox = getUrl(collectionThing, 'http://www.w3.org/ns/ldp#inbox') ?? '';
    const publisher = getUrl(collectionThing, 'http://schema.org/publisher') ?? '';

    if (!objectsUri || !name || !description) {

      throw new ArgumentError('Could not find uri, name or data in dataset', { objectsUri, name, description });

    }

    return {
      uri,
      name,
      description,
      objectsUri,
      distribution: distributionUri,
      inbox,
      publisher,
    };

  }

  /**
   * Creates an initial DataCatalog for storing collections
   *
   * @param uri Where the catalog should be saved
   */
  async createCatalog(uri: string): Promise<void> {

    const webId = this.solidService.getDefaultSession()?.info?.webId;

    if (!webId) {

      throw new ArgumentError('Not logged in', webId);

    }

    const profileDataset = await getSolidDataset(webId);
    const profile = getThing(profileDataset, webId);

    if (!profile) {

      throw new ArgumentError('Could not find profile in dataset', profile);

    }

    // no inbox uri exists, create one in the same folder as the catalog
    const catalogContainerUri = `${new URL(uri).origin}${new URL(uri).pathname.split('/').slice(0, -1).join('/')}/`;
    let inboxUri = `${catalogContainerUri}inbox/`;

    try {

      // create the inbox if it doesn't exist
      await this.getSession().fetch(inboxUri, {
        method: 'HEAD',
      }).then(async (res) => {

        if (res.status === 404) {

          inboxUri = await this.inboxService.createInbox(catalogContainerUri);

        }

      });

    } catch (error) {

      // eslint-disable-next-line no-console
      console.error('Error while creating inbox', error);

    }

    // fall back on foaf:name value if schema:name is missing
    const name = getStringWithLocale(profile, 'http://schema.org/name', 'nl')
      || getStringNoLocale(profile, 'http://schema.org/name')
      || getStringNoLocale(profile, 'http://xmlns.com/foaf/0.1/name') ;

    await overwriteFile(`${uri}`, new Blob([ `
    @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
    @prefix ldp: <http://www.w3.org/ns/ldp#>.
    @prefix schema: <http://schema.org/>.

    <>
      rdf:type schema:DataCatalog ;
      ldp:inbox <${inboxUri}> ;
      schema:name "Datacatalogus van ${name}"@nl ;
      schema:publisher <${webId}> .
    ` ], { type: 'text/turtle' }), { fetch: this.getSession().fetch });

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
