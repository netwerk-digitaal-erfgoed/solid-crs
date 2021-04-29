import { Alert, Event, State } from '@digita-ai/nde-erfgoed-components';
import { ConsoleLogger, LoggerLevel, SolidMockService } from '@digita-ai/nde-erfgoed-core';
import { map } from 'rxjs/operators';
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

const solid = new SolidMockService(new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly));

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

export type AppStates = AppRootStates | AppFeatureStates | AppAuthenticateStates;

/**
 * The application root machine and its configuration.
 */
export const appMachine = createMachine<AppContext, Event<AppEvents>, State<AppStates, AppContext>>({
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
              type: AppEvents.ADD_ALERT,
              alert: { type: 'danger', message: 'nde.root.alerts.error' },
            })),
          ],
        },
        [AppEvents.CLICKED_LOGIN]: {
          target: [
            `${AppRootStates.FEATURE}.${AppFeatureStates.COLLECTIONS}`,
            `${AppRootStates.AUTHENTICATE}.${AppAuthenticateStates.AUTHENTICATED}`,
          ],
        },
        [AppEvents.CLICKED_LOGOUT]: {
          target: [
            `${AppRootStates.FEATURE}.${AppFeatureStates.AUTHENTICATE}`,
            `${AppRootStates.AUTHENTICATE}.${AppAuthenticateStates.UNAUTHENTICATED}`,
          ],
        },
      },
      states: {
        [AppFeatureStates.COLLECTIONS]: {
          invoke: {
            id: AppActors.COLLECTIONS_MACHINE,
            src: collectionsMachine.withContext({}),
            onDone: AppFeatureStates.AUTHENTICATE,
            onError: {
              actions: send({ type: AppEvents.ERROR }),
            },
          },
        },
        [AppFeatureStates.AUTHENTICATE]: {
          invoke: {
            id: AppActors.AUTHENTICATE_MACHINE,
            src: authenticateMachine(solid).withContext({}),
            onDone: {
              actions: send({type: AppEvents.CLICKED_LOGIN }),
            },
            onError: {
              actions: send({ type: AppEvents.ERROR }),
            },
          },
        },
      },
    },
    [AppRootStates.AUTHENTICATE]: {
      initial: AppAuthenticateStates.UNAUTHENTICATED,
      states: {
        [AppAuthenticateStates.AUTHENTICATED]: {

        },
        [AppAuthenticateStates.UNAUTHENTICATED]: {
          invoke: {
            src: () => solid.logout(),
          },
        },
      },
    },
  },
});
