import { Alert, FormActors, formMachine, FormValidatorResult, State } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { Collection, CollectionObjectStore, CollectionObject, CollectionStore, SolidProfile, SolidSession, Route, routerStateConfig, NavigatedEvent, RouterStates, createRoute, activeRoute, routerEventsConfig, RouterEvents, updateHistory } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { createMachine } from 'xstate';
import { assign, forwardTo, log, send } from 'xstate/lib/actions';
import { SolidSDKService } from '@digita-ai/inrupt-solid-service';
import { addAlert, AddAlertEvent, addCollection, AppEvent, AppEvents, dismissAlert, LoggedOutEvent, ClickedLogoutEvent, removeSession, setCollections, setProfile, SetProfileEvent, setSession, ClickedCreateCollectionEvent } from './app.events';
import { collectionMachine } from './features/collection/collection.machine';
import { CollectionEvents, SelectedCollectionEvent } from './features/collection/collection.events';
import { searchMachine } from './features/search/search.machine';
import { SearchEvents, SearchUpdatedEvent } from './features/search/search.events';
import { objectMachine } from './features/object/object.machine';
import { ObjectEvents } from './features/object/object.events';
import { createPod } from './app.services';
import { LoanEvents } from './features/loan/loan.events';

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
  LOAN = '[AppFeatureState: Loan]',
}

/**
 * State indicates if a collection is being created.
 */
export enum AppDataStates {
  IDLE  = '[AppDataStates: Idle]',
  REFRESHING  = '[AppDataStates: Refreshing]',
  CREATING = '[AppDataStates: Creating]',
  CHECKING_TYPE_REGISTRATIONS = '[AppDataStates: Checking Type Registrations]',
  DETERMINING_POD_TYPE = '[AppDataStates: Determining Pod Type]',
  CHECKING_STORAGE= '[AppDataStates: Checking Storage]',
  AWAITING_POD_CREATION= '[AppDataStates: Awaiting Pod Creation]',
  CREATING_POD= '[AppDataStates: Creating Pod]',
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
  solid: SolidSDKService,
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
              send((c, event) => new NavigatedEvent(`/object/${encodeURIComponent(event.object.uri)}`, `${event.object.name} | Collectieregistratiesysteem`)),
              forwardTo(AppActors.OBJECT_MACHINE),
            ],
          },
          [CollectionEvents.SELECTED_COLLECTION]: {
            actions: [
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
          [LoanEvents.CLICKED_LOAN_REQUEST_OVERVIEW]: {
            actions: assign({ selected: (context, event) => undefined }),
            target: `#${AppFeatureStates.LOAN}`,
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
          [AppFeatureStates.LOAN]: {
            id: AppFeatureStates.LOAN,
            entry: send(new NavigatedEvent(`/loan`)),
            on: {
              [CollectionEvents.SELECTED_COLLECTION]: {
                target: AppFeatureStates.COLLECTION,
                actions: send((c, event) => event),
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
              [AppEvents.CLICKED_LOGOUT]: AppAuthenticateStates.UNAUTHENTICATING,
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
                actions: [
                  send(new LoggedOutEvent()),
                  () => window.localStorage.removeItem('solidClientAuthn:currentSession'),
                ],
              },
            },
            on: {
              [AppEvents.LOGGED_OUT]: {
                target: AppAuthenticateStates.UNAUTHENTICATED,
                // actions: () => location.reload(),
              },
            },
          },

          /**
           * The user has not been authenticated.
           */
          [AppAuthenticateStates.UNAUTHENTICATED]: {
            entry: send(() => new NavigatedEvent(`/login`)),
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
       * Handles pod config and collection creation.
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
              [AppEvents.SET_PROFILE]: AppDataStates.CHECKING_STORAGE,
              [CollectionEvents.CLICKED_DELETE]: AppDataStates.REFRESHING,
              [ObjectEvents.CLICKED_DELETE]: AppDataStates.REFRESHING,
              [CollectionEvents.SAVED_COLLECTION]: AppDataStates.REFRESHING,
            },
          },
          /**
           * Check whether a storage triple is present in the WebID.
           */
          [AppDataStates.CHECKING_STORAGE]: {
            tags: [ 'setup', 'loading' ],
            invoke: {
              src: (context) => solid.getStorages(context.session.webId),
              onDone: [
                {
                  target: AppDataStates.AWAITING_POD_CREATION,
                  cond: (c: AppContext, event) => event?.data && event.data.length === 0,
                },
                {
                  target: AppDataStates.CHECKING_TYPE_REGISTRATIONS,
                },
              ],
              onError: send((c, event) => event),
            },

          },
          /**
           * No storage triple present in the WebID, waiting for user input
           */
          [AppDataStates.AWAITING_POD_CREATION]: {
            tags: [ 'setup' ],
            on: {
              [AppEvents.CLICKED_LOGOUT]: {
                target: AppDataStates.IDLE,
                actions: send((c, event) => event),
              },
              [AppEvents.CLICKED_CREATE_POD]: {
                target: AppDataStates.CREATING_POD,
              },
            },
          },
          /**
           * Creates a Solid pod at pods.netwerkdigitaalerfgoed.nl.
           */
          [AppDataStates.CREATING_POD]: {
            tags: [ 'setup', 'loading' ],
            invoke: {
              src: () => createPod(solid),
              onDone: {
                target: AppDataStates.CHECKING_TYPE_REGISTRATIONS,
              },
              onError: {
                actions: send((c, event) => event),
              },
            },
          },
          /**
           * Checks existance of DataCatalog type registration
           * When none was found, further set-up is needed (DETERMINING_POD_TYPE)
           */
          [AppDataStates.CHECKING_TYPE_REGISTRATIONS]: {
            tags: [ 'setup', 'loading' ],
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
                  send(new ClickedLogoutEvent()),
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
            tags: [ 'setup' ],
            on: {
              [AppEvents.CLICKED_ADMINISTRATOR_TYPE]: [
                {
                  // The user is an admin, but no (valid) type registration was found
                  target: AppDataStates.IDLE,
                  actions: [
                    send(new AddAlertEvent({ message: 'authenticate.error.no-valid-type-registration', type: 'warning' })),
                    send(new ClickedLogoutEvent()),
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
            tags: [ 'loading' ],
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
            entry: log('aids'),
            tags: [ 'loading' ],
            invoke: {
              /**
               * Save collection to the store.
               */
              src: (c, event: ClickedCreateCollectionEvent) =>
                collectionStore.save(event.collection ?? collectionTemplate),
              onDone: {
                target: [ AppDataStates.IDLE ],
                actions: [
                  addCollection,
                  send((context, event) => new SelectedCollectionEvent(event.data)),
                ],
              },
              onError: {
                target: AppDataStates.IDLE,
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
