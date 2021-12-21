/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormContext } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { Collection, CollectionMemoryStore, CollectionObject, CollectionObjectMemoryStore, CollectionObjectSolidStore, CollectionObjectStore, CollectionSolidStore, CollectionStore } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { interpret, Interpreter } from 'xstate';
import { AppEvents } from '../../app.events';
import { appMachine } from '../../app.machine';
import { addAlert, CollectionEvents, SelectedCollectionEvent } from './collection.events';
import { CollectionContext, collectionMachine, CollectionStates, validateCollectionForm } from './collection.machine';

const solidService = { } as any;

describe('CollectionMachine', () => {

  const collection1: Collection = {
    uri: 'collection-uri-1',
    name: 'Collection 1',
    description: 'This is collection 1',
    objectsUri: 'http://test.uri/',
    distribution: 'http://test.uri/',
  };

  const collection2: Collection = {
    uri: 'collection-uri-2',
    name: 'Collection 2',
    description: 'This is collection 2',
    objectsUri: 'http://test.uri/',
    distribution: 'http://test.uri/',
  };

  const object1: CollectionObject = {
    uri: 'object-uri-1',
    name: 'Object 1',
    description: 'This is object 1',
    image: null,
    subject: null,
    type: null,
    updated: '0',
    collection: 'collection-uri-1',
  };

  let machine: Interpreter<CollectionContext>;
  let collectionStore: CollectionStore;
  let objectStore: CollectionObjectStore;

  beforeEach(() => {

    collectionStore = new CollectionMemoryStore([ collection1, collection2 ]);

    objectStore = new CollectionObjectMemoryStore([ object1 ]);

    objectStore.getObjectsForCollection = jest.fn(async() => [ object1 ]);

    machine = interpret(collectionMachine(collectionStore, objectStore, object1)
      .withContext({
        collection: collection1,
      }));

    machine.parent = interpret(appMachine(
      solidService,
      collectionStore,
      objectStore,
      collection1,
      object1
    ).withContext({
      alerts: [],
    }));

    const session = {
      info: {
        webId: 'https://test.webid',
      },
    };

    ((objectStore as any).getSession as any) = jest.fn(() => session);
    ((objectStore as any).getSession as any) = jest.fn(() => session);

  });

  it('should be correctly instantiated', () => {

    expect(machine).toBeTruthy();

  });

  it('should load objects when loading', async (done) => {

    objectStore.getObjectsForCollection = jest.fn().mockResolvedValue([
      {
        uri: 'object-uri-1',
        name: 'Object 1',
        description: 'This is object 1',
        image: null,
        subject: null,
        type: null,
        updated: '0',
        collection: 'collection-uri-1',
      },
      {
        uri: 'object-uri-2',
        name: 'Object 2',
        description: 'This is object 2',
        image: null,
        subject: null,
        type: null,
        updated: '0',
        collection: 'collection-uri-1',
      },
    ]);

    machine.onTransition((state) => {

      if(state.matches(CollectionStates.IDLE) && state.context?.collection) {

        expect(objectStore.getObjectsForCollection).toHaveBeenCalledTimes(1);

        expect(objectStore.getObjectsForCollection).toHaveBeenCalledWith(collection1);

        done();

      }

    });

    machine.start();

  });

  it('should save collection when saving', async (done) => {

    collectionStore.save = jest.fn().mockResolvedValueOnce(collection1);

    machine.onTransition((state) => {

      if(state.matches(CollectionStates.IDLE)) {

        machine.send(CollectionEvents.CLICKED_EDIT);

      }

      if(state.matches(CollectionStates.EDITING)) {

        machine.send(CollectionEvents.CLICKED_SAVE);

      }

      if(state.matches(CollectionStates.SAVING)) {

        done();

      }

    });

    machine.start();

  });

  it('should assign when selected collection', async (done) => {

    machine.onChange((context) => {

      if(context.collection?.uri === collection2.uri) {

        done();

      }

    });

    machine.start();

    machine.send({ type: CollectionEvents.SELECTED_COLLECTION, collection: collection2 } as SelectedCollectionEvent);

  });

  describe('addAlert', () => {

    it('should return action', () => {

      expect(addAlert({ type: 'success', message: 'foo' }).event()).toEqual({ alert: { type: 'success', message: 'foo' }, type: AppEvents.ADD_ALERT });

    });

  });

  describe('validateCollectionForm()', () => {

    let context: FormContext<Collection>;

    beforeEach(() => {

      context = {
        data: {
          description: 'description',
          name: 'name',
          uri: '',
          objectsUri: '',
          distribution: '',
        },
        original: {
          description: 'description',
          name: 'name',
          uri: '',
          objectsUri: '',
          distribution: '',
        },
      };

    });

    it('should return an empty list if no problems were found', async () => {

      const res = validateCollectionForm(context);
      await expect(res).resolves.toHaveLength(0);

    });

    it('should return an error when name is an empty string', async () => {

      context.data = { ...context.data, name: '' };
      const res = validateCollectionForm(context);
      await expect(res).resolves.toHaveLength(1);

    });

  });

  it('should transition from IDLE to CREATING_OBJECT when CLICKED_CREATE_OBJECT', async (done) => {

    collectionStore.save = jest.fn().mockResolvedValueOnce(collection1);

    machine.onTransition((state) => {

      if(state.matches(CollectionStates.IDLE)) {

        machine.send(CollectionEvents.CLICKED_CREATE_OBJECT);

      }

      if(state.matches(CollectionStates.CREATING_OBJECT)) {

        done();

      }

    });

    machine.start();

  });

  it('should transition from IDLE to EDITING when CLICKED_EDIT', async (done) => {

    machine.onTransition((state) => {

      if(state.matches(CollectionStates.IDLE)) {

        machine.send(CollectionEvents.CLICKED_EDIT);

      }

      if(state.matches(CollectionStates.EDITING)) {

        done();

      }

    });

    machine.start();

  });

});
