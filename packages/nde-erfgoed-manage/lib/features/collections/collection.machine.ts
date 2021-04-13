import { AnyEventObject, assign, Machine, MachineConfig, MachineOptions } from 'xstate';
import { Collection, MemoryStore, Store} from '@digita-ai/nde-erfgoed-core';
import { CollectionsContext } from './collections.context';

const collections: Store<Collection> = new MemoryStore<Collection>([
  {
    uri: 'test',
    name: 'Foo',
  },
  {
    uri: 'test',
    name: 'Bar',
  },
]);

export const collectionsStates: MachineConfig<CollectionsContext, any, AnyEventObject> = {
  id: 'collections',
  initial: 'initial',
  context: {
    collections: [],
  },
  states: {
    initial: {
      on: {
        LOAD: 'loading',
        LOGOUT: 'logout',
        TEST: {
          actions: [
            'addTestCollection',
          ],
        },
      },
    },
    loading: {
      invoke: {
        src: 'loadCollectionsService',
        onDone: {
          actions: [ 'storeLoadedCollections' ],
          target: 'loaded',
        },
      },
    },
    loaded: {
      on: {
        LOGOUT: 'logout',
      },
    },
    logout: {
      type:'final',
    },
  },
};

export const collectionsOptions: Partial<MachineOptions<CollectionsContext, AnyEventObject>> = {
  actions: {
    addTestCollection: assign({ collections: (context, event) => [
      ...context.collections,
      { name: `Test Collection ${context.collections.length + 1}` } as Collection,
    ] }),
    storeLoadedCollections: assign({ collections: (context, event) => event.loadedCollections }),
  },
  services: {
    loadCollectionsService: (context, event) => collections.all().toPromise(),
  },
};

export const collectionsMachine = Machine(collectionsStates, collectionsOptions);
