import { AnyEventObject, Machine, MachineConfig } from 'xstate';
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
