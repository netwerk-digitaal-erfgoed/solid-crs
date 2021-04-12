import { from } from 'rxjs';
import { AnyEventObject, interpret, Machine, MachineConfig, spawn } from 'xstate';
import { collectionsMachine } from './features/collections/collection.machine';

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
      invoke: {
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
const s = spawn(collectionsMachine);
s.subscribe();
export const appState = from(appService);
