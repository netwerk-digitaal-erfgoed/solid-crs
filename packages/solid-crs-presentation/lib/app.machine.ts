import { Alert, State } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { ArgumentError, Collection, CollectionObjectStore, CollectionSolidStore, CollectionStore, SolidProfile, SolidService, SolidSession, Route, activeRoute, urlVariables, RouterStates, updateHistory, routerStateConfig } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { createMachine } from 'xstate';
import { assign, forwardTo, log, send } from 'xstate/lib/actions';
import { addAlert, AddAlertEvent, AppEvent, AppEvents, dismissAlert, NavigatedEvent, NavigateEvent, setCollections, setProfile } from './app.events';
import { CollectionEvents } from './features/collection/collection.events';
import { searchMachine } from './features/search/search.machine';
import { SearchEvents, SearchUpdatedEvent } from './features/search/search.events';
import { objectMachine } from './features/object/object.machine';
import { ObjectEvents, SelectedObjectEvent } from './features/object/object.events';
import { collectionMachine } from './features/collection/collection.machine';

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
   * The URL path
   */
  path?: string;

  /**
   * The last value of the search input field
   */
  lastSearchTerm?: string;
}

/**
 * Actor references for this machine config.
 */
export enum AppActors {
  APP_MACHINE = 'AppMachine',
  COLLECTION_MACHINE = 'CollectionMachine',
  SEARCH_MACHINE = 'SearchMachine',
  OBJECT_MACHINE = 'ObjectMachine',
}

/**
 * State references for the application root, with readable log format.
 */
export enum AppRootStates {
  FEATURE  = '[AppState: Features]',
  DATA  = '[AppState: Data]',
  SEARCH  = '[AppState: Search]',
}

/**
 * State references for the application's features, with readable log format.
 */
export enum AppFeatureStates {
  INIT  = '[AppFeatureState: Initializing]',
  COLLECTION  = '[AppFeatureState: Collection]',
  SEARCH  = '[AppFeatureState: Search]',
  OBJECT = '[AppFeatureState: Object]',
  NOT_FOUND = '[AppFeatureState: Not found]',
  ABOUT  = '[AppFeatureState: About]',
}

/**
 * State indicates if a collection is being created.
 */
export enum AppDataStates {
  LOADING_PROFILE  = '[AppDataStates: Loading profile]',
  LOADING_COLLECTIONS  = '[AppDataStates: Loading collections]',
  LOADING_OBJECT  = '[AppDataStates: Loading object]',
  LOADED_DATA  = '[AppDataStates: Loaded data]',
}

/**
 * Union type of all app events.
 */
export type AppStates = AppRootStates | AppFeatureStates | RouterStates | AppDataStates;

const routes: Route[] = [
  {
    title: 'Collectie | Solid CRS',
    path: '/{{webId}}/collection/{{collectionUri}}',
    targets: [ RouterStates.IDLE, `#${AppFeatureStates.COLLECTION}` ],
  },
  {
    title: 'Object overzicht | Solid CRS',
    path: '/{{webId}}/object/{{objectUri}}',
    targets: [ RouterStates.IDLE, `#${AppDataStates.LOADING_OBJECT}` ],
  },
  {
    title: 'Zoeken | Solid CRS',
    path: '/{{webId}}/search/{{searchTerm}}',
    targets: [ RouterStates.IDLE, `#${AppFeatureStates.SEARCH}` ],
  },
  {
    title: 'Over | Solid CRS',
    path: '/{{webId}}/about',
    targets: [ RouterStates.IDLE, `#${AppFeatureStates.ABOUT}` ],
  },
];

/**
 * The application root machine and its configuration.
 */
export const appMachine = (
  solidService: SolidService,
  collectionStore: CollectionStore,
  objectStore: CollectionObjectStore,
) => createMachine<AppContext, AppEvent, State<AppStates, AppContext>>({
  id: AppActors.APP_MACHINE,
  context: {
    alerts: [],
  },
  type: 'parallel',
  on: {
    [ObjectEvents.SELECTED_OBJECT]: {
      actions: [
        send((context, event) => new NavigatedEvent(`/${encodeURIComponent(context.profile?.uri)}/object/${encodeURIComponent(event.object.uri)}`)),
        forwardTo(AppActors.OBJECT_MACHINE),
      ],
    },
    [AppEvents.NAVIGATE]: {
      target: [ `#${RouterStates.NAVIGATING}` ],
      actions: [
        assign({ path: (context, event) => event.path||window.location.pathname }),
      ],
    },
    [AppEvents.NAVIGATED]: {
      actions: (context, event) => updateHistory(event.path, event.title),
    },
    [AppEvents.CLICKED_HOME]: {
      actions: assign({ selected: (context) => undefined }),
      target: `#${AppFeatureStates.ABOUT}`,
    },
  },
  states: {
    /**
     * Router
     */
    ...routerStateConfig(routes),
    /**
     * Determines which feature is currently active.
     */
    [AppRootStates.FEATURE]: {
      initial: AppFeatureStates.INIT,
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
            send((context, event) => new AddAlertEvent({ type: 'danger', message: event.data?.error ? event.data.error.toString() : 'app.root.alerts.error' })),
          ],
        },
        [SearchEvents.SEARCH_UPDATED]: [
          {
            cond: (_, event: SearchUpdatedEvent) => event.searchTerm?.length > 0,
            target: `#${AppFeatureStates.SEARCH}`,
            actions: [
              send((context, event) => new NavigatedEvent(`/${encodeURIComponent(context.profile?.uri)}/search/${event.searchTerm}`)),
              assign((context) => ({ selected: undefined })),
            ],
          },
          {
            actions: assign((context, event) => ({
              lastSearchTerm: event.searchTerm,
            })),
          },
        ],
      },
      states: {
        /**
         * Shows the 404 page for invalid URLs
         */
        [AppFeatureStates.NOT_FOUND]: {
          id: AppFeatureStates.NOT_FOUND,
        },
        /**
         * Loads data before needed in other feature states
         */
        [AppFeatureStates.INIT]: {
          id: AppFeatureStates.INIT,
          initial: AppDataStates.LOADING_PROFILE,
          states: {
            /**
             * Not refreshing or creating collections.
             */
            [AppDataStates.LOADED_DATA]: {
              type: 'final',
            },
            [AppDataStates.LOADING_PROFILE]: {
              invoke: [
                {
                  /**
                   * Get all collections from store.
                   */
                  src: () => solidService.getProfile(decodeURIComponent(urlVariables(activeRoute(routes).path).get('webId'))),
                  onDone: [
                    {
                      target: [ AppDataStates.LOADING_COLLECTIONS ],
                      actions: [
                        setProfile,
                        (context, event) => (collectionStore as CollectionSolidStore).webId = event.data.uri,
                      ],
                    },
                  ],
                  onError: {
                    target: `#${AppFeatureStates.NOT_FOUND}`,
                  },
                },
              ],
            },
            /**
             * Refresh collections, set current collection and assign to state.
             */
            [AppDataStates.LOADING_COLLECTIONS]: {
              invoke: [
                {
                  /**
                   * Get all collections from store.
                   */
                  src: () => collectionStore.all(),
                  onDone: [
                    {
                      target: AppDataStates.LOADED_DATA,
                      actions: [
                        setCollections,
                        send(new NavigateEvent()),
                      ],
                    },
                  ],
                  onError: {
                    actions: send((context, event) => event),
                  },
                },
              ],
            },
            [AppDataStates.LOADING_OBJECT]: {
              entry: log('loading data'),
              id: AppDataStates.LOADING_OBJECT,
              invoke: {
                src: async () => {

                  if (window.location.pathname?.match(/^\/.+\/object\/.+\/?$/)) {

                    return objectStore.get(decodeURIComponent(urlVariables(activeRoute(routes).path).get('objectUri')));

                  } else throw new ArgumentError('invalid URL for this state', window.location.pathname);

                },
                onDone: [
                  {
                    cond: (c, event) => !event.data,
                    target: [ AppDataStates.LOADED_DATA, `#${AppFeatureStates.OBJECT}` ],
                    actions: [ log('error data') ],
                  },
                  {
                    cond: (c, event) => !!event.data,
                    target: [ AppDataStates.LOADED_DATA, `#${AppFeatureStates.OBJECT}` ],
                    actions: [ log('loaded data'), send((c, event) => new SelectedObjectEvent(event.data)) ],
                  },
                ],
                onError: {
                  actions: send((c, event) => event),
                },
              },
            },
          },
        },
        [AppFeatureStates.ABOUT]: {
          id: AppFeatureStates.ABOUT,
          entry: [
            send((context) => new NavigatedEvent(`/${encodeURIComponent(context.profile?.uri)}/about`)),
          ],
          on: {
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
        },
        /**
         * The collection feature is shown.
         */
        [AppFeatureStates.COLLECTION]: {
          id: AppFeatureStates.COLLECTION,
          entry: [
            send((context, event) => new NavigatedEvent(`/${encodeURIComponent(context.profile?.uri)}/collection/${encodeURIComponent(context.selected.uri)}`)),
            assign({ selected: (context) =>
              context.selected
                || context.collections?.find((collection) =>
                  collection.uri === decodeURIComponent(urlVariables(activeRoute(routes).path).get('collectionUri')))
                || context.collections[0] }),
          ],
          on: {
            [ObjectEvents.SELECTED_OBJECT]: {
              target: AppFeatureStates.OBJECT,
              actions: [
                send((context, event) => event),
                assign({ lastSearchTerm: (context, event) => undefined }),
              ],
            },
            [CollectionEvents.SELECTED_COLLECTION]: {
              actions: [
                send((context, event) => new NavigatedEvent(`/${encodeURIComponent(context.profile?.uri)}/collection/${encodeURIComponent(event.collection.uri)}`)),
                forwardTo(AppActors.COLLECTION_MACHINE),
                assign({ selected: (context, event) => event.collection }),
              ],
            },
          },
          invoke: [
            {
              id: AppActors.COLLECTION_MACHINE,
              src: collectionMachine(objectStore),
              data: (context) => ({
                collection: context.selected,
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
              actions: [
                send((context, event) => event),
                assign({ selected: (context, event) =>
                  context.collections.find((collection) => collection.uri === event.object.collection) }),
              ],
            },
            /**
             * Forward the search updated event to the search machine.
             */
            [SearchEvents.SEARCH_UPDATED]: {
              actions: [
                assign({ lastSearchTerm: (context, event) => event.searchTerm }),
                send((context, event) => event, { to: AppActors.SEARCH_MACHINE }),
              ],
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
                searchTerm: event.searchTerm||(urlVariables(activeRoute(routes).path).get('searchTerm')||''),
              }),
              onDone: {
                actions: send((context, event) => ({
                  type: CollectionEvents.SELECTED_COLLECTION,
                  collection: context.collections[0],
                })),
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
              actions: send((context, event) => event),
            },
          },
          invoke: [
            {
              id: AppActors.OBJECT_MACHINE,
              src: objectMachine(),
              data: (context) => ({
                collections: context.collections,
              }),
              onError: {
                actions: send((context, event) => event),
              },
            },
          ],
        },
      },
    },
  },
});
