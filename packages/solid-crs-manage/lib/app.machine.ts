import { Alert, FormActors, formMachine, FormValidatorResult, State } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { Collection, CollectionObjectStore, CollectionStore, CollectionObject } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { createMachine } from 'xstate';
import { assign, forwardTo, log, send } from 'xstate/lib/actions';
import history from 'history/browser';
import { addAlert, addCollection, AppEvent, AppEvents, dismissAlert, removeSession, setCollections, setProfile, setSession } from './app.events';
import { SolidSession } from './common/solid/solid-session';
import { SolidService } from './common/solid/solid.service';
import { authenticateMachine } from './features/authenticate/authenticate.machine';
import { collectionMachine } from './features/collection/collection.machine';
import { CollectionEvents } from './features/collection/collection.events';
import { SolidProfile } from './common/solid/solid-profile';
import { searchMachine } from './features/search/search.machine';
import { SearchEvents, SearchUpdatedEvent } from './features/search/search.events';
import { objectMachine } from './features/object/object.machine';
import { ObjectEvents } from './features/object/object.events';

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

  /**
   * The current path
   */
  path?: string[];
}

/**
 * Actor references for this machine config.
 */
export enum AppActors {
  APP_MACHINE = 'AppMachine',
  COLLECTION_MACHINE = 'CollectionMachine',
  AUTHENTICATE_MACHINE = 'AuthenticateMachine',
  SEARCH_MACHINE = 'SearchMachine',
  OBJECT_MACHINE = 'ObjectMachine',
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
  ROUTING = '[AppFeatureState: Routing]',
  AUTHENTICATE = '[AppFeatureState: Authenticate]',
  COLLECTION  = '[AppFeatureState: Collection]',
  SEARCH  = '[AppFeatureState: Search]',
  OBJECT = '[AppFeatureState: Object]',
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
  collectionTemplate: Collection,
  objectTemplate: CollectionObject,
) =>
  createMachine<AppContext, AppEvent, State<AppStates, AppContext>>({
    id: AppActors.APP_MACHINE,
    type: 'parallel',
    on: {
      [ObjectEvents.SELECTED_OBJECT]: {
        actions: forwardTo(AppActors.OBJECT_MACHINE),
      },
    },
    states: {
    /**
     * Determines which feature is currently active.
     */
      [AppRootStates.FEATURE]: {
        initial: AppFeatureStates.ROUTING,
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
        },
        states: {
          /**
           * Routing to the correct feature based on the url.
           */
          [AppFeatureStates.ROUTING]: {
            always: [
              {
                cond: () => history.location.pathname.startsWith('/collections'),
                actions: assign({ path: (context, event) => [ '/collections', history.location.pathname.replace(/^\/collections/, '') ] }),
                target: AppFeatureStates.COLLECTION,
              },
              {
                cond: () => history.location.pathname.startsWith('/objects'),
                actions: assign({ path: (context, event) => [ '/objects', history.location.pathname.replace(/^\/objects/, '') ] }),
                target: AppFeatureStates.OBJECT,
              },
              {
                cond: () => history.location.pathname.startsWith('/search'),
                actions: assign({ path: (context, event) => [ '/search', history.location.pathname.replace(/^\/search/, '') ] }),
                target: AppFeatureStates.SEARCH,
              },
              {
                actions: assign({ path: (context, event) => [] }),
                target: AppFeatureStates.COLLECTION,
              },
            ],
          },
          /**
           * The collection feature is shown.
           */
          [AppFeatureStates.COLLECTION]: {
            on: {
              [ObjectEvents.SELECTED_OBJECT]: {
                target: AppFeatureStates.OBJECT,
                actions: send((context, event) => event),
              },
              [SearchEvents.SEARCH_UPDATED]: {
                actions: assign({
                  selected: (context, event) => undefined,
                }),
                target: AppFeatureStates.SEARCH,
                cond: (_, event: SearchUpdatedEvent) => event.searchTerm !== undefined && event.searchTerm !== '',
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
                src: collectionMachine(collectionStore, objectStore, objectTemplate),
                data: (context) => ({
                  collection: context.selected,
                  path: context.path.slice(1),
                }),
                onError: {
                  actions: send({ type: AppEvents.ERROR }),
                },
              },
            ],
          },
          /**
           * Shows the search feature.
           */
          [AppFeatureStates.SEARCH]: {
            on: {
              [ObjectEvents.SELECTED_OBJECT]: {
                target: AppFeatureStates.OBJECT,
                actions: send((context, event) => event),
              },
              /**
               * Forward the search updated event to the search machine.
               */
              [SearchEvents.SEARCH_UPDATED]: {
                actions: send((context, event) => event, { to: AppActors.SEARCH_MACHINE }),
              },
              /**
               * Transition to collection feature when a collection is selected.
               */
              [CollectionEvents.SELECTED_COLLECTION]: {
                target: AppFeatureStates.COLLECTION,
                actions: [
                  assign({ selected: (context, event) => event.collection ? event.collection : context.selected }),
                ],
              },
            },
            /**
             * Invoke the search achine.
             */
            invoke: [
              {
                id: AppActors.SEARCH_MACHINE,
                src: searchMachine(collectionStore, objectStore),
                data: (context, event: SearchUpdatedEvent) => ({
                  searchTerm: event.searchTerm,
                  path: context.path.slice(1),
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
          /**
           * The object feature is shown.
           */
          [AppFeatureStates.OBJECT]: {
            on: {
              [CollectionEvents.SELECTED_COLLECTION]: {
                target: AppFeatureStates.COLLECTION,
                actions: send((context, event) => event),
              },
              [SearchEvents.SEARCH_UPDATED]: {
                actions: assign({
                  selected: (context, event) => undefined,
                }),
                target: AppFeatureStates.SEARCH,
                cond: (_, event: SearchUpdatedEvent) => event.searchTerm !== undefined && event.searchTerm !== '',
              },
            },
            invoke: [
              {
                id: AppActors.OBJECT_MACHINE,
                src: objectMachine(objectStore),
                data: (context) => ({
                  collections: context.collections,
                  path: context.path.slice(1),
                }),
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
                  async (): Promise<FormValidatorResult[]> => [],
                ),
                data: {
                  data: { searchTerm: '' },
                  original: { searchTerm: '' },
                },
              },
            ],
            on: {
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
            on: {
              [AppEvents.LOGGED_OUT]: AppAuthenticateStates.UNAUTHENTICATED,
            },
          },

          /**
           * The user has not been authenticated.
           */
          [AppAuthenticateStates.UNAUTHENTICATED]: {
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
              [ObjectEvents.CLICKED_DELETE]: AppDataStates.REFRESHING,
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
              src: () => collectionStore.save(collectionTemplate), // TODO: Update
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
