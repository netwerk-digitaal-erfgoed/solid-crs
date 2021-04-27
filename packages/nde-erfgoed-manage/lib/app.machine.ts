import { Alert, Event, State } from '@digita-ai/nde-erfgoed-components';
import { createMachine } from 'xstate';
import { log, send } from 'xstate/lib/actions';
import { addAlert, AppEvents, dismissAlert } from './app.events';
import { authenticateMachine } from './features/authenticate/authenticate.machine';
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
 * The root context of the application.
 */
export interface AppContext {
  /**
   * App-wide alerts.
   */
  alerts: Alert[];
  session: unknown;
  loggedIn: boolean;
}

export const initialAppContext = {
  alerts: [] as Alert[],
  session: {},
  loggedIn: false,
};

/**
 * Actor references for this machine config.
 */
export enum AppActors {
  APP_MACHINE = 'AppMachine',
  COLLECTIONS_MACHINE = 'CollectionMachine',
  AUTHENTICATE_MACHINE = 'AuthenticateMachine',
}

/**
 * State references for the application root, with readable log format.
 */
export enum AppRootStates {
  AUTHENTICATE = '[AppState: Authenticate]',
  FEATURE  = '[AppState: Features]',
}

/**
 * State references for the application's features, with readable log format.
 */
export enum AppFeatureStates {
  AUTHENTICATE = '[AppFeatureState: Authenticate]',
  COLLECTIONS  = '[AppFeatureState: Collections]',
}

/**
 * State references for the application's features, with readable log format.
 */
export enum AppAuthenticateStates {
  AUTHENTICATED = '[AppAuthenticateState: Authenticated]',
  UNAUTHENTICATED  = '[AppAuthenticateState: Unauthenticated]',
}

/**
 * The application root machine and its configuration.
 */
export const appMachine = createMachine<AppContext, Event<AppEvents>, State<AppRootStates, AppContext>>({
  id: AppActors.APP_MACHINE,
  type: 'parallel',
  states: {
    [AppRootStates.FEATURE]: {
      initial: AppFeatureStates.AUTHENTICATE,
      on: {
        [AppEvents.DISMISS_ALERT]: {
          actions: dismissAlert,
        },
        [AppEvents.ADD_ALERT]: {
          actions: addAlert,
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
        [AppFeatureStates.COLLECTIONS]: {
          invoke: {
            id: AppActors.COLLECTIONS_MACHINE,
            src: collectionsMachine.withContext({}),
            onDone: AppFeatureStates.AUTHENTICATE,
          },
        },
        [AppFeatureStates.AUTHENTICATE]: {
          invoke: {
            id: AppActors.AUTHENTICATE_MACHINE,
            src: authenticateMachine.withContext({}),
            onDone: {
              target: AppFeatureStates.COLLECTIONS,
            },
          },
        },
      },
    },
    [AppRootStates.AUTHENTICATE]: {
      initial: AppAuthenticateStates.UNAUTHENTICATED,
      // on: {

      // },
      states: {
        [AppAuthenticateStates.AUTHENTICATED]: {

        },
        [AppAuthenticateStates.UNAUTHENTICATED]: {

        },
      },
    },
  },
});
