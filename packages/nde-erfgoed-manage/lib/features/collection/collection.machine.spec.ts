import { Collection, CollectionObjectMemoryStore, CollectionObjectStore, MemoryStore, Store } from '@digita-ai/nde-erfgoed-core';
import { interpret, Interpreter } from 'xstate';
import { AppEvents } from '../../app.events';
import { addAlert, CollectionEvents, SelectedCollectionEvent } from './collection.events';
import { CollectionContext, collectionMachine, CollectionStates } from './collection.machine';

describe('CollectionMachine', () => {

  const collection1 = {
    uri: 'collection-uri-1',
    name: 'Collection 1',
    description: 'This is collection 1',
  };

  const collection2 = {
    uri: 'collection-uri-2',
    name: 'Collection 2',
    description: 'This is collection 2',
  };

  let machine: Interpreter<CollectionContext>;
  let collectionStore: Store<Collection>;
  let objectStore: CollectionObjectStore;

  beforeEach(() => {

    collectionStore = new MemoryStore<Collection>([ collection1, collection2 ]);

    objectStore = new CollectionObjectMemoryStore([
      {
        uri: 'object-uri-1',
        name: 'Object 1',
        description: 'This is object 1',
        image: null,
        subject: null,
        type: null,
        updated: 0,
        collection: 'collection-uri-1',
      },
    ]);

    machine = interpret<CollectionContext>(collectionMachine(collectionStore, objectStore)
      .withContext({
        collection: collection1,
      }));

  });

  it('should be correctly instantiated', () => {

    expect(machine).toBeTruthy();

  });

  it('should transition to editing when clicked edit was emitted', async (done) => {

    machine.onTransition((state) => {

      if(state.matches(CollectionStates.EDITING)) {

        done();

      }

    });

    machine.start();
    machine.send(CollectionEvents.CLICKED_EDIT);

  });

  it('should transition to deleting when clicked edit was emitted', async (done) => {

    machine.onTransition((state) => {

      if(state.matches(CollectionStates.DELETING)) {

        done();

      }

    });

    machine.start();
    machine.send(CollectionEvents.CLICKED_DELETE);

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
        updated: 0,
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

  // it('should save collection when saving', async (done) => {

  //   collectionStore.save = jest.fn().mockResolvedValueOnce(collection1);

  //   machine.onTransition((state) => {

  //     if(state.matches(CollectionStates.IDLE) && state.context?.collection) {

  //       expect(collectionStore.save).toHaveBeenCalledTimes(1);

  //       expect(collectionStore.save).toHaveBeenCalledWith(collection1);

  //       done();

  //     }

  //   });

  //   machine.start();
  //   machine.send(CollectionEvents.SELECTED_COLLECTION, { collection: collection1 });

  //   machine.send(CollectionEvents.CLICKED_SAVE);

  // });

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

});
