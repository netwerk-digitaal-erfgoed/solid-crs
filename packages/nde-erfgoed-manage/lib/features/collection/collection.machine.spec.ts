import { Collection, CollectionObjectMemoryStore, CollectionObjectStore, MemoryStore, Store } from '@digita-ai/nde-erfgoed-core';
import { interpret, Interpreter } from 'xstate';
import { CollectionEvents } from './collection.events';
import { CollectionContext, collectionMachine, CollectionStates } from './collection.machine';

describe('CollectionMachine', () => {

  let machine: Interpreter<CollectionContext>;
  let collectionStore: Store<Collection>;
  let objectStore: CollectionObjectStore;

  beforeEach(() => {

    collectionStore = new MemoryStore<Collection>([
      {
        uri: 'collection-uri-1',
        name: 'Collection 1',
        description: 'This is collection 1',
      },
      {
        uri: 'collection-uri-2',
        name: 'Collection 2',
        description: 'This is collection 2',
      },
    ]);

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

    machine = interpret<CollectionContext>(collectionMachine(collectionStore, objectStore).withContext({
      collection: {
        uri: 'collection-uri-1',
        name: 'Collection 1',
        description: 'This is collection 1',
      },
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

    objectStore.getObjectsForCollection = jest.fn();

    machine.onTransition(() => {

      expect(objectStore.getObjectsForCollection).toHaveBeenCalledTimes(1);

      expect(objectStore.getObjectsForCollection).toHaveBeenCalledWith({
        uri: 'collection-uri-1',
        name: 'Collection 1',
        description: 'This is collection 1',
      });

      done();

    });

    machine.start();

  });

  it('should save collection when saving', async (done) => {

    collectionStore.save = jest.fn().mockResolvedValueOnce({
      uri: 'collection-uri-1',
      name: 'Collection 1',
      description: 'This is collection 1',
    });

    machine.onTransition((state) => {

      if(state.matches(CollectionStates.IDLE)) {

        expect(collectionStore.save).toHaveBeenCalledTimes(1);

        expect(collectionStore.save).toHaveBeenCalledWith({
          uri: 'collection-uri-1',
          name: 'Collection 1',
          description: 'This is collection 1',
        });

        done();

      }

    });

    machine.start();
    machine.send(CollectionEvents.CLICKED_SAVE);

  });

});
