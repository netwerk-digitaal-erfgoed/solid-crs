import { Collection, CollectionMemoryStore, CollectionObject, CollectionObjectMemoryStore, CollectionObjectStore, CollectionStore } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { interpret, Interpreter } from 'xstate';
import { AppEvents } from '../../app.events';
import { appMachine } from '../../app.machine';
import { addAlert, CollectionEvents, SelectedCollectionEvent } from './collection.events';
import { CollectionContext, collectionMachine, CollectionStates } from './collection.machine';

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

    machine = interpret(collectionMachine(objectStore)
      .withContext({
        collection: collection1,
      }));

    machine.parent = interpret(appMachine(
      collectionStore,
      objectStore,
    ).withContext({
      alerts: [],
    }));

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

  it('should assign when selected collection', async (done) => {

    machine.onChange((context) => {

      if(context.collection?.uri === collection2.uri) {

        done();

      }

    });

    machine.start();

    machine.send({ type: CollectionEvents.SELECTED_COLLECTION, collection: collection2 } as SelectedCollectionEvent);

  });

  it('should send error event to parent when loading failed', async(done) => {

    objectStore.getObjectsForCollection = jest.fn().mockRejectedValue(undefined);

    machine.parent.onEvent((event) => {

      if(event && event.type === AppEvents.ERROR) {

        done();

      }

    });

    machine.start();

    machine.parent.start();

  });

  describe('addAlert', () => {

    it('should return action', () => {

      expect(addAlert({ type: 'success', message: 'foo' }).event()).toEqual({ alert: { type: 'success', message: 'foo' }, type: AppEvents.ADD_ALERT });

    });

  });

});
