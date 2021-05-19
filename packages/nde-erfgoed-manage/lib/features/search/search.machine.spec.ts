import { CollectionMemoryStore, CollectionObjectMemoryStore, CollectionObjectStore, CollectionStore, ConsoleLogger, LoggerLevel } from '@digita-ai/nde-erfgoed-core';
import { interpret, Interpreter } from 'xstate';
import { appMachine } from '../../app.machine';
import { SolidMockService } from '../../common/solid/solid-mock.service';
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
    updated: 0,
    collection: 'collection-uri-1',
  };

  let machine: Interpreter<SearchContext>;
  let collectionStore: CollectionStore;
  let objectStore: CollectionObjectStore;
  const searchTerm = 'collection 2';

  beforeEach(() => {

    collectionStore = new CollectionMemoryStore([ collection1, collection2 ]);

    objectStore = new CollectionObjectMemoryStore([ object1 ]);

    machine = interpret<SearchContext>(searchMachine(collectionStore, objectStore).withContext({ searchTerm }));

    machine.parent = interpret(appMachine(
      new SolidMockService(new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly)),
      collectionStore,
      objectStore,
      {}
    ));

  });

  it('should be correctly instantiated', () => {

    expect(machine).toBeTruthy();

  });

  it('should start without errors', async (done) => {

    const collectionStoreSearch = jest.spyOn(collectionStore, 'search');
    // const objectStoreSearch = jest.spyOn(objectStore, 'search');

    machine.onTransition((state) => {

      if(state.matches(SearchStates.IDLE) && state.context?.collections) {

        expect(state.context?.collections).toEqual([ collection2 ]);
        expect(collectionStoreSearch).toHaveBeenCalledTimes(1);
        expect(collectionStoreSearch).toHaveBeenCalledWith(searchTerm);
        // expect(objectStoreSearch).toHaveBeenCalledTimes(1);
        // expect(objectStoreSearch).toHaveBeenCalledWith(searchTerm);
        done();

      }

    });

    machine.start();

  });

});
