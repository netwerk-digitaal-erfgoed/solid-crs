import { Alert, State } from '@digita-ai/nde-erfgoed-components';
import { Collection } from '@digita-ai/nde-erfgoed-core';
import { of } from 'rxjs';
import { createMachine } from 'xstate';
import { log, send } from 'xstate/lib/actions';
import { addAlert, AppEvent, AppEvents, dismissAlert, removeSession, setSession } from './app.events';
import { SolidSession } from './common/solid/solid-session';
import { SolidService } from './common/solid/solid.service';
import { authenticateMachine } from './features/authenticate/authenticate.machine';
import { collectionMachine } from './features/collection/collection.machine';
import { loadCollectionsService } from './features/collection/collection.services';

/**
 * The root context of the application.
 */
export interface AppContext {
  /**
   * App-wide alerts.
   */
  alerts: Alert[];

  /**
   * The session of the current user.
   */
  session?: SolidSession;

  /**
   * The collections retrieved from the user's pod
   */
  collections?: Collection[];
}

/**
 * Actor references for this machine config.
 */
export enum AppActors {
  APP_MACHINE = 'AppMachine',
  COLLECTION_MACHINE = 'CollectionMachine',
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
  COLLECTION  = '[AppFeatureState: Collection]',
}

/**
 * State references for the application's features, with readable log format.
 */
export enum AppAuthenticateStates {
  AUTHENTICATED = '[AppAuthenticateState: Authenticated]',
  UNAUTHENTICATED  = '[AppAuthenticateState: Unauthenticated]',
  UNAUTHENTICATING  = '[AppAuthenticateState: Unauthenticating]',
}

/**
 * Union type of all app events.
 */
export type AppStates = AppRootStates | AppFeatureStates | AppAuthenticateStates;

/**
 * The application root machine and its configuration.
 */
export const appMachine = (solid: SolidService) => createMachine<AppContext, AppEvent, State<AppStates, AppContext>>({
  id: AppActors.APP_MACHINE,
  type: 'parallel',
  states: {
    /**
     * Determines which feature is currently active.
     */
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
        [AppEvents.LOGGED_IN]: {
          target: [
            `${AppRootStates.FEATURE}.${AppFeatureStates.COLLECTION}`,
            `${AppRootStates.AUTHENTICATE}.${AppAuthenticateStates.AUTHENTICATED}`,
          ],
          actions: setSession,
        },
        [AppEvents.LOGGING_OUT]: {
          target: [
            `${AppRootStates.AUTHENTICATE}.${AppAuthenticateStates.UNAUTHENTICATING}`,
          ],
          actions: removeSession,
        },
      },
      states: {
        /**
         * The collection feature is shown.
         */
        [AppFeatureStates.COLLECTION]: {
          invoke: [
            // {
            //   src: (c, e) => loadCollectionsService.toPromise(),
            //   onDone: {
            //     actions: null, // add to context
            //   },
            // },
            {
              id: AppActors.COLLECTION_MACHINE,
              src: collectionMachine.withContext({
                currentCollection: null,
              }),
              onDone: AppFeatureStates.AUTHENTICATE,
              onError: {
                actions: send({ type: AppEvents.ERROR }),
              },
            },
          ],
        },
        /**
         * The authenticate feature is active.
         */
        [AppFeatureStates.AUTHENTICATE]: {
          invoke: {
            id: AppActors.AUTHENTICATE_MACHINE,
            src: authenticateMachine(solid).withContext({ }),
            /**
             * Send logged in event when authenticate machine is done, and the user has authenticated.
             */
            onDone: {
              actions: send((_, event) => ({type: AppEvents.LOGGED_IN, session: event.data.session })),
            },
            onError: {
              actions: send({ type: AppEvents.ERROR }),
            },
          },
        },
      },
    },
    /**
     * Determines if the current user is authenticated or not.
     */
    [AppRootStates.AUTHENTICATE]: {
      initial: AppAuthenticateStates.UNAUTHENTICATED,
      on: {
        [AppEvents.LOGGED_OUT]: {
          target: [
            `${AppRootStates.FEATURE}.${AppFeatureStates.AUTHENTICATE}`,
            `${AppRootStates.AUTHENTICATE}.${AppAuthenticateStates.UNAUTHENTICATED}`,
          ],
        },
      },
      states: {
        /**
         * The user is authenticated.
         */
        [AppAuthenticateStates.AUTHENTICATED]: {

        },

        /**
         * The user is logging out.
         */
        [AppAuthenticateStates.UNAUTHENTICATING]: {
          invoke: {
            src: () => solid.logout(),
            onDone: {
              actions: send({ type: AppEvents.LOGGED_OUT }),
            },
          },
        },

        /**
         * The user has not been authenticated.
         */
        [AppAuthenticateStates.UNAUTHENTICATED]: {
        },
      },
    },
  },
});
