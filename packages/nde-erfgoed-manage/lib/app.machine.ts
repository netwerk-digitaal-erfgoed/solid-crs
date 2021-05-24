import { Alert, FormActors, formMachine, FormValidatorResult, State } from '@digita-ai/nde-erfgoed-components';
import { Collection, CollectionObjectStore, CollectionStore } from '@digita-ai/nde-erfgoed-core';
import { createMachine } from 'xstate';
import { assign, forwardTo, log, send } from 'xstate/lib/actions';
import { Observable, of } from 'rxjs';
import { addAlert, addCollection, AppEvent, AppEvents, dismissAlert, removeSession, setCollections, setProfile, setSession } from './app.events';
import { SolidSession } from './common/solid/solid-session';
import { SolidService } from './common/solid/solid.service';
import { authenticateMachine } from './features/authenticate/authenticate.machine';
import { collectionMachine } from './features/collection/collection.machine';
import { CollectionEvents } from './features/collection/collection.events';
import { SolidProfile } from './common/solid/solid-profile';
import { searchMachine } from './features/search/search.machine';
import { SearchEvents, SearchUpdatedEvent } from './features/search/search.events';

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

  /**
   * The profile retrieved from the user's pod
   */
  profile?: SolidProfile;

  /**
   * The selected collection from the user's pod
   */
  selected?: Collection;
}

/**
 * Actor references for this machine config.
 */
export enum AppActors {
  APP_MACHINE = 'AppMachine',
  COLLECTION_MACHINE = 'CollectionMachine',
  AUTHENTICATE_MACHINE = 'AuthenticateMachine',
  SEARCH_MACHINE = 'SearchMachine',
}

/**
 * State references for the application root, with readable log format.
 */
export enum AppRootStates {
  AUTHENTICATE = '[AppState: Authenticate]',
  FEATURE  = '[AppState: Features]',
  DATA  = '[AppState: Data]',
  SEARCH  = '[AppState: Search]',
}

/**
 * State references for the application's features, with readable log format.
 */
export enum AppFeatureStates {
  AUTHENTICATE = '[AppFeatureState: Authenticate]',
  COLLECTION  = '[AppFeatureState: Collection]',
  SEARCH  = '[AppFeatureState: Search]',
}

/**
 * State indicates if a collection is being created.
 */
export enum AppDataStates {
  IDLE  = '[AppCreationStates: Idle]',
  REFRESHING  = '[AppCreationStates: Refreshing]',
  CREATING = '[AppCreationStates: Creating]',
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
export const appMachine = (
  solid: SolidService,
  collectionStore: CollectionStore,
  objectStore: CollectionObjectStore,
  template: Collection,
) =>
  createMachine<AppContext, AppEvent, State<AppStates, AppContext>>({
    id: AppActors.APP_MACHINE,
    type: 'parallel',
    states: {
    /**
     * Determines which feature is currently active.
     */
      [AppRootStates.FEATURE]: {
        initial: AppFeatureStates.AUTHENTICATE,
        on: {

          [AppEvents.LOGGED_OUT]: `${AppRootStates.FEATURE}.${AppFeatureStates.AUTHENTICATE}`,
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
        },
        states: {
        /**
         * The collection feature is shown.
         */
          [AppFeatureStates.COLLECTION]: {
            // Invoke the collection machine
            on: {
              [SearchEvents.SEARCH_UPDATED]: {
                actions: assign({
                  selected: (context, event) => undefined,
                }),
                target: AppFeatureStates.SEARCH,
              },
              [CollectionEvents.SELECTED_COLLECTION]: {
                actions: [
                  forwardTo(AppActors.COLLECTION_MACHINE),
                  assign({ selected: (context, event) => event.collection }),
                ],
              },
            },
            invoke: [
              {
                id: AppActors.COLLECTION_MACHINE,
                src: collectionMachine(collectionStore, objectStore),
                data: (context, event) => ({
                  collection: context.selected,
                }),
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
            on: {
              [AppEvents.LOGGED_IN]: AppFeatureStates.COLLECTION,
            },
            invoke: {
              id: AppActors.AUTHENTICATE_MACHINE,
              src: authenticateMachine(solid).withContext({ }),
              /**
               * Send logged in event when authenticate machine is done, and the user has authenticated.
               */
              onDone: {
                actions: send((_, event) => ({ type: AppEvents.LOGGED_IN, session: event.data.session })),
              },
              onError: {
                actions: send({ type: AppEvents.ERROR }),
              },
            },
          },
          [AppFeatureStates.SEARCH]: {
            on: {
              [SearchEvents.SEARCH_UPDATED]: {
                actions: send((context, event) => event, { to: AppActors.SEARCH_MACHINE }),
              },
              [CollectionEvents.SELECTED_COLLECTION]: {
                target: AppFeatureStates.COLLECTION,
                actions: [
                  assign({ selected: (context, event) => event.collection ? event.collection : context.selected }),
                ],
              },
            },
            invoke: [
              {
                id: AppActors.SEARCH_MACHINE,
                src: searchMachine(collectionStore, objectStore),
                data: (context, event: SearchUpdatedEvent) => ({
                  searchTerm: event.searchTerm,
                }),
                onDone: {
                  actions: send((context, event) => ({
                    type: CollectionEvents.SELECTED_COLLECTION,
                    collection: context.collections[0],
                  })),
                },
                onError: {
                  actions: send({ type: AppEvents.ERROR }),
                },
              },
            ],
          },
        },
      },
      /**
       * Determines if the current user is authenticated or not.
       */
      [AppRootStates.AUTHENTICATE]: {
        initial: AppAuthenticateStates.UNAUTHENTICATED,
        states: {
          /**
           * The user is authenticated.
           */
          [AppAuthenticateStates.AUTHENTICATED]: {
            invoke: [
              /**
               * Get profile and assign to context.
               */
              {
                src: (context, event) => solid.getProfile(context.session.webId),
                onDone: {
                  actions: setProfile,
                },
              },
              {
                id: FormActors.FORM_MACHINE,
                src: formMachine<{ searchTerm: string }>(
                  (): Observable<FormValidatorResult[]> => of([]),
                ),
                data: {
                  data: { searchTerm: '' },
                  original: { searchTerm: '' },
                },

              },
            ],
            on: {
              [AppEvents.LOGGED_OUT]: AppAuthenticateStates.UNAUTHENTICATED,
              [AppEvents.LOGGING_OUT]: AppAuthenticateStates.UNAUTHENTICATING,
            },
          },

          /**
           * The user is logging out.
           */
          [AppAuthenticateStates.UNAUTHENTICATING]: {
            entry: removeSession,
            invoke: {
              /**
               * Logout from identity provider.
               */
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
            on: {
              [AppEvents.LOGGED_IN]: {
                target: AppAuthenticateStates.AUTHENTICATED,
                actions: setSession,
              },
            },
          },
        },
      },
      /**
       * Determines if the current user is creating a collection.
       */
      [AppRootStates.DATA]: {
        initial: AppDataStates.IDLE,
        states: {
          /**
           * Not refreshing or creating collections.
           */
          [AppDataStates.IDLE]: {
            on: {
              [AppEvents.CLICKED_CREATE_COLLECTION]: AppDataStates.CREATING,
              [AppEvents.LOGGED_IN]: AppDataStates.REFRESHING,
              [CollectionEvents.CLICKED_DELETE]: AppDataStates.REFRESHING,
              [CollectionEvents.SAVED_COLLECTION]: AppDataStates.REFRESHING,
            },
          },
          /**
           * Refresh collections, set current collection and assign to state.
           */
          [AppDataStates.REFRESHING]: {
            invoke: {
              /**
               * Get all collections from store.
               */
              src: () => collectionStore.all(),
              onDone: [
                {
                  target: AppDataStates.IDLE,
                  actions: [
                    setCollections,
                    send((context, event) => ({
                      type: CollectionEvents.SELECTED_COLLECTION,
                      collection: event.data.find((collection: Collection) =>
                        context.selected?.uri === collection.uri) ?? event.data[0],
                    })),
                  ],
                  cond: (context, event) => event.data.length > 0,
                },
                {
                  target: AppDataStates.CREATING,
                },
              ],
              onError: {
                actions: send((context, event) => ({ type: AppEvents.ERROR, data: event.data })),
              },
            },
          },
          /**
           * Creating a new collection.
           */
          [AppDataStates.CREATING]: {
            invoke: {
              /**
               * Save collection to the store.
               */
              src: () => collectionStore.save(template), // TODO: Update
              onDone: {
                target: AppDataStates.IDLE,
                actions: [
                  addCollection,
                  send((context, event) => ({ type: CollectionEvents.SELECTED_COLLECTION, collection: event.data })),
                ],
              },
              onError: {
                actions: [
                  send((context, event) => ({ type: AppEvents.ERROR, data: event.data })),
                ],
              },
            },
          },
        },
      },
    },
  });
