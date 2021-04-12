import { from } from 'rxjs';
import { AnyEventObject, interpret, Machine, MachineConfig, spawn } from 'xstate';
import { collectionsMachine, collectionsService } from './features/collections/collection.machine';

export const appStates: MachineConfig<any, any, AnyEventObject> = {
  id: 'app',
  initial: 'collections',
  states: {
    authenticate: {
      on: {
        LOGIN: 'collections',
      },
    },
    collections: {
      onDone: 'authenticate',
      invoke: {
        id: 'collections',
        src: collectionsMachine,
        onDone: 'authenticate',
      },
      on: {
        LOGOUT: 'authenticate',
      },
    },
  },
};

export const appMachine = Machine(appStates);
export const appService = interpret(appMachine);
collectionsService.parent = appService;
export const appState = from(appService);
