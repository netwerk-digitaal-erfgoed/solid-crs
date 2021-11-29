import { Alert, FormActors, formMachine, FormValidatorResult, State } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { Collection, CollectionObjectStore, CollectionObject, CollectionStore, SolidService, SolidProfile, SolidSession, Route, routerStateConfig, NavigatedEvent, RouterStates, createRoute, activeRoute, routerEventsConfig, RouterEvents, updateHistory } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { createMachine } from 'xstate';
import { assign, forwardTo, log, send } from 'xstate/lib/actions';
import { addAlert, AddAlertEvent, addCollection, AppEvent, AppEvents, dismissAlert, LoggedInEvent, LoggedOutEvent, LoggingOutEvent, removeSession, setCollections, setProfile, SetProfileEvent, setSession } from './app.events';
import { authenticateMachine } from './features/authenticate/authenticate.machine';
import { collectionMachine } from './features/collection/collection.machine';
import { CollectionEvents, SelectedCollectionEvent } from './features/collection/collection.events';
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
   * The URI of the DataCatalog in which the collections are stored
   */
  catalog?: Collection;

  /**
   * The path of the router
   */
  path?: string;
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
  WAITING_FOR_AUTH = '[AppFeatureState: Waiting For Auth]',
  COLLECTION  = '[AppFeatureState: Collection]',
  SEARCH  = '[AppFeatureState: Search]',
  OBJECT = '[AppFeatureState: Object]',
  IDLE = '[AppFeatureState: Idle]',
}

/**
 * State indicates if a collection is being created.
 */
export enum AppDataStates {
  IDLE  = '[AppCreationStates: Idle]',
  REFRESHING  = '[AppCreationStates: Refreshing]',
  CREATING = '[AppCreationStates: Creating]',
  CHECKING_TYPE_REGISTRATIONS = '[AppCreationStates: Checking Type Registrations]',
  DETERMINING_POD_TYPE = '[AppCreationStates: Determining Pod Type]',
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
export type AppStates = AppRootStates | AppFeatureStates | AppAuthenticateStates | RouterStates;

/**
 * The routing configuration for the app machine
 */
export const routes: Route[] = [
  createRoute(
    '.*',
    [ `#${AppFeatureStates.COLLECTION}` ],
  ),
];

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
    context: {
      alerts: [],
    },
    type: 'parallel',
    on: {
      /**
       * Router events
       */
      ... (routerEventsConfig as any)(),
    },
    states: {
      /**
       * Router
       */
      ... (routerStateConfig as any)(routes),
      /**
       * Determines which feature is currently active.
       */
      [AppRootStates.FEATURE]: {
        initial: AppFeatureStates.WAITING_FOR_AUTH,
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
              send((c, event) => new AddAlertEvent({ type: 'danger', message: event.data?.error ? event.data.error.toString() : 'app.root.alerts.error' })),
            ],
          },
          [ObjectEvents.SELECTED_OBJECT]: {
            actions: [
              log('selected object'),
              send((c, event) => new NavigatedEvent(`/object/${encodeURIComponent(event.object.uri)}`, `${event.object.name} | Collectieregistratiesysteem`)),
              forwardTo(AppActors.OBJECT_MACHINE),
            ],
          },
          [CollectionEvents.SELECTED_COLLECTION]: {
            actions: [
              log('selected collection'),
              send((c, event) => new NavigatedEvent(`/collection/${encodeURIComponent(event.collection?.uri)}`, `${event.collection?.name} | Collectieregistratiesysteem`)),
              assign({ selected: (c, event) => event.collection }),
              forwardTo(AppActors.COLLECTION_MACHINE),
            ],
          },
          [SearchEvents.SEARCH_UPDATED]: {
            actions: [
              send((c, event) => new NavigatedEvent(`/search/${event.searchTerm}`)),
              assign({ selected: (context, event) => undefined }),
            ],
            target: `#${AppFeatureStates.SEARCH}`,
            cond: (_, event: SearchUpdatedEvent) => event.searchTerm !== undefined && event.searchTerm !== '',
          },
          [RouterEvents.NAVIGATED]: {
            // this overwrites default behavior as defined in the routerStateConfig
            actions: [
              (c, event) => updateHistory(event.path, event.title),
              assign({ alerts: () => [] }),
            ],
          },
        },
        states: {
          /**
           * Only create the collection machine once the user has logged in and the session is set
           */
          [AppFeatureStates.WAITING_FOR_AUTH]: {
            id: AppFeatureStates.WAITING_FOR_AUTH,
            on: {
              [AppEvents.SET_PROFILE]: {
                target: AppFeatureStates.COLLECTION,
              },
            },
          },
          /**
           * The collection feature is shown.
           */
          [AppFeatureStates.COLLECTION]: {
            id: AppFeatureStates.COLLECTION,
            entry: [
              // send((context, event) => new NavigatedEvent(`/collection/${encodeURIComponent(context.selected.uri)}`)),
              assign({ selected: (context) =>
                context.selected
                  ?? context.collections?.find((collection) =>
                    collection.uri === decodeURIComponent(activeRoute(routes).pathParams.get('collectionUri')))
                  ?? context.collections ? context.collections[0] : undefined }),
            ],
            on: {
              [ObjectEvents.SELECTED_OBJECT]: {
                target: AppFeatureStates.OBJECT,
                actions: send((context, event) => event),
              },
            },
            invoke: [
              {
                id: AppActors.COLLECTION_MACHINE,
                src: collectionMachine(collectionStore, objectStore, objectTemplate),
                data: (context) => ({
                  collection: context.selected,
                  webId: context.session?.webId,
                }),
                onError: {
                  actions: send((context, event) => event),
                },
              },
            ],
          },
          /**
           * Shows the search feature.
           */
          [AppFeatureStates.SEARCH]: {
            id: AppFeatureStates.SEARCH,
            on: {
              [ObjectEvents.SELECTED_OBJECT]: {
                target: AppFeatureStates.OBJECT,
                actions: send((context, event) => event),
              },
              /**
               * Forward the search updated event to the search machine.
               */
              [SearchEvents.SEARCH_UPDATED]: {
                actions: [
                  send((c, event) => new NavigatedEvent(`/search/${event.searchTerm}`)),
                  send((context, event) => event, { to: AppActors.SEARCH_MACHINE }),
                ],
              },
              /**
               * Transition to collection feature when a collection is selected.
               */
              [CollectionEvents.SELECTED_COLLECTION]: {
                target: AppFeatureStates.COLLECTION,
                actions: [
                  send((c, event) => event),
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
                }),
                onDone: {
                  actions: send((context, event) => new SelectedCollectionEvent(context.collections[0])),
                },
                onError: {
                  actions: send((context, event) => event),
                },
              },
            ],
          },
          /**
           * The object feature is shown.
           */
          [AppFeatureStates.OBJECT]: {
            id: AppFeatureStates.OBJECT,
            on: {
              [CollectionEvents.SELECTED_COLLECTION]: {
                target: AppFeatureStates.COLLECTION,
                actions: send((c, event) => event),
              },
            },
            invoke: [
              {
                id: AppActors.OBJECT_MACHINE,
                src: objectMachine(objectStore),
                data: (context) => ({
                  collections: context.collections,
                  webId: context.session?.webId,
                }),
                onError: {
                  actions: send((context, event) => event),
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
                src: (context) => solid.getProfile(context.session.webId),
                onDone: {
                  actions: [
                    setProfile,
                    send(new SetProfileEvent()),
                  ],
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
                actions: send(new LoggedOutEvent()),
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
                actions: send((_, event) => new LoggedInEvent(event.data.session)),
              },
              onError: {
                actions: send((context, event) => event),
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
              [AppEvents.SET_PROFILE]: AppDataStates.CHECKING_TYPE_REGISTRATIONS,
              [CollectionEvents.CLICKED_DELETE]: AppDataStates.REFRESHING,
              [ObjectEvents.CLICKED_DELETE]: AppDataStates.REFRESHING,
              [CollectionEvents.SAVED_COLLECTION]: AppDataStates.REFRESHING,
            },
          },
          /**
           * Checks existance of DataCatalog type registration
           * When none was found, further set-up is needed (DETERMINING_POD_TYPE)
           */
          [AppDataStates.CHECKING_TYPE_REGISTRATIONS]: {
            invoke: {
              src: (context) => collectionStore.getInstanceForClass(context.profile.uri, 'http://schema.org/DataCatalog'),
              onDone: [
                {
                  target: AppDataStates.DETERMINING_POD_TYPE,
                  cond: (context, event) => !event.data,
                },
                {
                  target: AppDataStates.REFRESHING,
                },
              ],
              onError: {
                actions:  [
                  send(new AddAlertEvent({ message: 'authenticate.error.no-valid-type-registration', type: 'warning' })),
                  send(new LoggingOutEvent()),
                ],
              },
            },
          },
          /**
           * User can decide whether the current Solid pod should be used
           * as heritage collection/object storage (pod type: institution),
           * or that it is an administrator's pod, accessing an institution's pod (pod type: administrator)
           */
          [AppDataStates.DETERMINING_POD_TYPE]: {
            on: {
              [AppEvents.CLICKED_ADMINISTRATOR_TYPE]: [
                {
                  // The user is an admin, but no (valid) type registration was found
                  target: AppDataStates.IDLE,
                  actions: [
                    send(new AddAlertEvent({ message: 'authenticate.error.no-valid-type-registration', type: 'warning' })),
                    send(new LoggingOutEvent()),
                  ],
                },
              ],
              [AppEvents.CLICKED_INSTITUTION_TYPE]: [
                // The pod will be used as storage and necessary files
                // will be created here when missing
                {
                  target: AppDataStates.REFRESHING,
                },
              ],
            },
          },
          // TODO create another state for checking permissions?
          /**
           * Refresh collections, set current collection and assign to state.
           */
          [AppDataStates.REFRESHING]: {
            id: AppDataStates.REFRESHING,
            invoke: {
              /**
               * Get all collections from store.
               */
              src: () => collectionStore.all(),
              onDone: [
                {
                  target: [ AppDataStates.IDLE ],
                  actions: [
                    send((c, event) => new SelectedCollectionEvent(event.data[0])),
                    setCollections,
                  ],
                  cond: (c, event) => event.data.length > 0,
                },
                {
                  target: AppDataStates.CREATING,
                },
              ],
              onError: {
                actions: send((c, event) => event),
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
              src: () => collectionStore.save(collectionTemplate),
              onDone: {
                target: [ AppDataStates.IDLE ],
                actions: [
                  addCollection,
                  send((context, event) => new SelectedCollectionEvent(event.data)),
                ],
              },
              onError: {
                actions: [
                  send((context, event) => event),
                ],
              },
            },
          },
        },
      },
    },
  });
