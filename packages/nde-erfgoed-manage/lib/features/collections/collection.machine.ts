import { from } from 'rxjs';
import {  map } from 'rxjs/operators';
import { AnyEventObject, assign, interpret, Machine, MachineConfig, MachineOptions } from 'xstate';
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
      },
    },
    loading: {
      invoke: {
        src: (context, event) =>
          collections.all().pipe(
            map((loadedCollections) => ({ type: 'LOADED', loadedCollections })),
          ),
        onDone: 'loaded',
      },
      on: {
        LOADED: {actions:[
          assign({ collections: (context, event) => event.loadedCollections }),
        ]},
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
//   actions: {
//     // action implementations
//     activate: (context, event) => {
//       console.log('activating...');
//     },
//   },
};

export const collectionsMachine = Machine(collectionsStates, collectionsOptions);
export const collectionsService = interpret(collectionsMachine);
export const collectionsState = from(collectionsService);
