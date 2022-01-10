import { CollectionMemoryStore, CollectionObjectMemoryStore, CollectionObjectStore, CollectionStore, ConsoleLogger, LoggerLevel, SolidMockService } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { interpret, Interpreter } from 'xstate';
import { appMachine } from '../../app.machine';
import { SearchEvents, SearchUpdatedEvent } from './search.events';
import { SearchContext, searchMachine, SearchStates } from './search.machine';

describe('SearchMachine', () => {

  const collection1 = {
    uri: 'collection-uri-1',
    name: 'Collection 1',
    description: 'This is collection 1',
    objectsUri: '',
    distribution: '',
  };

  const collection2 = {
    uri: 'collection-uri-2',
    name: 'Collection 2',
    description: 'This is collection 2',
    objectsUri: '',
    distribution: '',
  };

  const object1 = {
    uri: 'object-uri-1',
    name: 'Object 1',
    description: 'This is object 1',
    image: null,
    subject: null,
    type: null,
    updated: '1',
    collection: 'collection-uri-1',
  };

  let machine: Interpreter<SearchContext>;
  let collectionStore: CollectionStore;
  let objectStore: CollectionObjectStore;
  const searchTerm = 'uri';

  beforeEach(() => {

    collectionStore = new CollectionMemoryStore([ collection1, collection2 ]);

    collectionStore.all = jest.fn(async() => [ collection1, collection2 ]);

    objectStore = new CollectionObjectMemoryStore([ object1 ]);

    objectStore.search = jest.fn(async() => [ object1 ]);

    machine = interpret(searchMachine(collectionStore, objectStore).withContext({ searchTerm }));

    machine.parent = interpret(appMachine(
      new SolidMockService(new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly)),
      collectionStore,
      objectStore,
      collection1,
      object1
    ));

  });

  it('should be correctly instantiated', () => {

    expect(machine).toBeTruthy();

  });

  it('should start without errors', (done) => {

    const objectStoreSearch = jest.spyOn(objectStore, 'search');

    machine.onTransition((state) => {

      if(state.matches(SearchStates.IDLE)) {

        expect(state.context?.objects).toEqual([ object1 ]);
        expect(objectStoreSearch).toHaveBeenCalledTimes(1);
        expect(objectStoreSearch).toHaveBeenCalledWith(searchTerm, [ object1 ]);
        done();

      }

    });

    machine.start();

  });

  it('should transition to searching when typing', (done) => {

    machine.onTransition((state) => {

      if(state.matches(SearchStates.SEARCHING)) {

        done();

      }

      if(state.matches(SearchStates.IDLE)) {

        machine.send({ type: SearchEvents.SEARCH_UPDATED, searchTerm: 'object' } as SearchUpdatedEvent);

      }

    });

    machine.start();

  });

  it('should transition to dismissed when searchTerm was empty', (done) => {

    machine.onTransition((state) => {

      if(state.matches(SearchStates.DISMISSED)) {

        done();

      }

      if(state.matches(SearchStates.IDLE)) {

        machine.send({ type: SearchEvents.SEARCH_UPDATED, searchTerm: '' } as SearchUpdatedEvent);

      }

    });

    machine.start();

  });

});
