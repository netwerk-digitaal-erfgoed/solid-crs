import { createMachine, MachineConfig } from 'xstate';
import { log, send } from 'xstate/lib/actions';
import { addAlert, dismissAlert } from './app.actions';
import { AppContext } from './app.context';
import { AppEvent, AppEvents } from './app.events';
import { AppSchema, AppState, AppStates, FeatureStates } from './app.states';
import { authenticateConfig } from './features/authenticate/authenticate.machine';
import { AuthenticateStates } from './features/authenticate/authenticate.states';
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
export const appState: MachineConfig<any, AppSchema, any> = {
  id: AppActors.APP_MACHINE,
  type: 'parallel',
  states: {
    [AppStates.FEATURE]: {
      initial: FeatureStates.COLLECTIONS,
      on: {
        [AppEvents.ADD_ALERT]: {
          actions: addAlert,
        },
        [AppEvents.DISMISS_ALERT]: {
          actions: dismissAlert,
        },
        [AppEvents.ERROR]: {
          actions: [
            log(() => 'An error occurred'),
            send(() => ({
              alert: { type: 'danger', message: 'nde.root.alerts.error' },
              type: AppEvents.ADD_ALERT,
            })),
          ],
        },
      },
      states: {
        [FeatureStates.COLLECTIONS]: {
          entry: log('AppMachine entered state "collections"', 'AppMachine'),
          invoke: {
            id: AppActors.COLLECTIONS_MACHINE,
            src: collectionsMachine.withContext({}),
          },
        },
        [FeatureStates.AUTHENTICATE]: {
          entry: log('AppMachine entered state "authenticate"', 'AppMachine'),
        },
      },
    },
    [AppStates.AUTHENTICATE]: authenticateConfig,
  },
};

/**
 * The application root machine.
 */
export const appMachine = createMachine<AppContext, AppEvent, AppState>(appState);
