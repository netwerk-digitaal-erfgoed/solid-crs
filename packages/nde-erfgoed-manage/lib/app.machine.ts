import { createMachine, MachineConfig } from 'xstate';
import { log } from 'xstate/lib/actions';
import { AppContext } from './app.context';
import { AppEvent, AppEvents } from './app.events';
import { AppSchema, AppState, AppStates } from './app.states';
import { collectionsMachine } from './features/collections/collections.machine';

/**
 * These are the possible functions that can be referenced from a machine config (preferably put each kind in its own file):
 * - guards: Record<string, ConditionPredicate<CollectionsContext, CollectionsEvent>>;
 * - actions: ActionFunctionMap<CollectionsContext, CollectionsEvent>;
 * - activities: Record<string, ActivityConfig<CollectionsContext, CollectionsEvent>>;
 * - services: Record<string, ServiceConfig<CollectionsContext, CollectionsEvent>>;
 * - delays: DelayFunctionMap<CollectionsContext, CollectionsEvent>;
 */

/**
 * Actor references for this machine config.
 */
export enum AppActors {
  APP_MACHINE = 'AppMachine',
  COLLECTIONS_MACHINE = 'CollectionMachine',
}

/**
 * The machine config for the application root machine.
 */
export const appState: MachineConfig<AppContext, AppSchema, AppEvent> = {
  id: AppActors.APP_MACHINE,
  initial: AppStates.COLLECTIONS,
  states: {
    [AppStates.AUTHENTICATE]: {
      entry: log('AppMachine entered state "authenticate"', 'AppMachine'),
      on: {
        [AppEvents.LOGIN]: {
          target: AppStates.COLLECTIONS,
          actions: log((context, event) => `User logged in. Current context: ${context}`, 'AppMachine'),
        },
      },
    },
    [AppStates.COLLECTIONS]: {
      entry: log('AppMachine entered state "collections"', 'AppMachine'),
      invoke: {
        id: AppActors.COLLECTIONS_MACHINE,
        src: collectionsMachine.withContext({}),
        onDone: AppStates.AUTHENTICATE,
      },
      on: {
        [AppEvents.LOGOUT]: AppStates.AUTHENTICATE,
      },
    },
  },
};

/**
 * The application root machine.
 */
export const appMachine = createMachine<AppContext, AppEvent, AppState>(appState);
