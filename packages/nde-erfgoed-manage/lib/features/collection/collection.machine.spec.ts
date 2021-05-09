import { Collection, CollectionObjectMemoryStore, MemoryStore } from '@digita-ai/nde-erfgoed-core';
import { interpret, Interpreter } from 'xstate';
import { CollectionEvents } from './collection.events';
import { CollectionContext, collectionMachine, CollectionStates } from './collection.machine';

describe('CollectionMachine', () => {

  let machine: Interpreter<CollectionContext>;

  beforeEach(() => {

    const collectionStore = new MemoryStore<Collection>([
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

    const objectStore = new CollectionObjectMemoryStore([
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

});
