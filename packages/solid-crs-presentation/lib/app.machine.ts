import { Alert, State } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { Collection, CollectionObjectStore, CollectionStore } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { createMachine } from 'xstate';
import { assign, forwardTo, log, send } from 'xstate/lib/actions';
import { addAlert, AddAlertEvent, AppEvent, AppEvents, dismissAlert, NavigateEvent, setCollections } from './app.events';
import { SolidSession } from './common/solid/solid-session';
import { collectionMachine } from './features/collection/collection.machine';
import { CollectionEvents } from './features/collection/collection.events';
import { SolidProfile } from './common/solid/solid-profile';
import { searchMachine } from './features/search/search.machine';
import { SearchEvents, SearchUpdatedEvent } from './features/search/search.events';
import { objectMachine } from './features/object/object.machine';
import { ObjectEvents, SelectedObjectEvent } from './features/object/object.events';

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
  ROUTER  = '[AppState: Router]',
}

/**
 * State references for the application's features, with readable log format.
 */
export enum AppFeatureStates {
  INIT  = '[AppFeatureState: Initializing]',
  COLLECTION  = '[AppFeatureState: Collection]',
  SEARCH  = '[AppFeatureState: Search]',
  OBJECT = '[AppFeatureState: Object]',
}

/**
 * State references for the application's features, with readable log format.
 */
export enum AppRouterStates {
  IDLE = '[AppRouterStates: Idle]',
  NAVIGATING = '[AppRouterStates: Navigating]',
  RESOLVING_ROUTE  = '[AppRouterStates: Resolving Route]',
}

/**
 * State indicates if a collection is being created.
 */
export enum AppDataStates {
  REFRESHING  = '[AppDataStates: Refreshing]',
  LOADED_DATA  = '[AppDataStates: Loaded data]',
}

/**
 * Union type of all app events.
 */
export type AppStates = AppRootStates | AppFeatureStates;

/**
 * The application root machine and its configuration.
 */
export const appMachine = (
  collectionStore: CollectionStore,
  objectStore: CollectionObjectStore,
) =>
  createMachine<AppContext, AppEvent, State<AppStates, AppContext>>({
    id: AppActors.APP_MACHINE,
    type: 'parallel',
    on: {
      [ObjectEvents.SELECTED_OBJECT]: {
        actions: [
          forwardTo(AppActors.OBJECT_MACHINE),
          (context, event: SelectedObjectEvent) => window.history.pushState({ page: '' }, '', `object/${encodeURIComponent(event.object.uri)}`),
        ],
      },
      [AppEvents.NAVIGATE]: {
        target: `#${AppRouterStates.RESOLVING_ROUTE}`,
      },
    },
    states: {
      /**
       * Resolves URL path to a state
       */
      [AppRootStates.ROUTER]: {
        initial: AppRouterStates.IDLE,
        states: {
          [AppRouterStates.IDLE]: {
          },
          [AppRouterStates.RESOLVING_ROUTE]: {
            id: AppRouterStates.RESOLVING_ROUTE,
            entry: assign({ path: () => window.location.pathname }),
            always: { target: AppRouterStates.NAVIGATING },
          },
          [AppRouterStates.NAVIGATING]: {
            always: [
              {
                cond: (context) => !!context.path?.match(/^\/collection\/?$/),
                actions: (context) => window.history.pushState({ page: 'another' }, 'another page', `collection/${encodeURIComponent(context.collections[0].uri)}`),
                target: [ AppRouterStates.IDLE, `#${AppFeatureStates.COLLECTION}` ],
              },
              {
                cond: (context) => !!context.path?.match(/^\/collection\/.+\/?$/),
                target: [ AppRouterStates.IDLE, `#${AppFeatureStates.COLLECTION}` ],
              },
              {
                cond: (context) => !!context.path?.match(/^\/object\/?$/),
                actions: (context) => window.history.pushState({ page: 'another' }, 'another page', `collection/${encodeURIComponent(context.collections[0].uri)}`),
                target: [ AppRouterStates.IDLE, `#${AppFeatureStates.COLLECTION}` ],
              },
              {
                cond: (context) => !!context.path?.match(/^\/object\/.+\/?$/),
                target: [ AppRouterStates.IDLE, `#${AppFeatureStates.OBJECT}` ],
              },
              {
                cond: (context) => !!context.path?.match(/^\/search\/?/),
                target: [ AppRouterStates.IDLE, `#${AppFeatureStates.SEARCH}` ],
              },
              {
                cond: (context) => context.path.replace('/', '').trim().length < 1,
                actions: (context) => window.history.pushState({ page: 'another' }, 'another page', `collection/${encodeURIComponent(context.collections[0].uri)}`),
                target: [ AppRouterStates.IDLE, `#${AppFeatureStates.COLLECTION}` ],
              },
              {
                actions: [
                  (context) => window.history.pushState({ page: 'another' }, 'another page', `collection/${encodeURIComponent(context.collections[0].uri)}`),
                  log((context) => `no path found for ${context.path}`),
                ],
                target: [ AppRouterStates.IDLE, `#${AppFeatureStates.COLLECTION}` ],
              },
            ],
          },
        },
      },
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
              send((context, event) => new AddAlertEvent({ type: 'danger', message: event.data?.error ? event.data.error.toString() : 'nde.root.alerts.error' })),
            ],
          },
        },
        states: {
          /**
           * Loads data before needed in other feature states
           */
          [AppFeatureStates.INIT]: {

            initial: AppDataStates.REFRESHING,
            states: {
              /**
               * Not refreshing or creating collections.
               */
              [AppDataStates.LOADED_DATA]: {
                type: 'final',
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
              },
            },
          },
          /**
           * The collection feature is shown.
           */
          [AppFeatureStates.COLLECTION]: {
            entry: [
              log('entered collection state'),
              assign({ selected: (context) =>
                context.selected
                || context.collections?.find((collection) =>
                  collection.uri === decodeURIComponent(window.location.pathname.split('/collection/')[1]))
                || context.collections[0] }),
              (context) => window.history.pushState({ page: '' }, '', `collection/${encodeURIComponent(context.selected.uri)}`),
            ],
            id: AppFeatureStates.COLLECTION,
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
                actions: send((context, event) => event),
              },
              /**
               * Forward the search updated event to the search machine.
               */
              [SearchEvents.SEARCH_UPDATED]: {
                actions: [
                  send((context, event) => event, { to: AppActors.SEARCH_MACHINE }),
                  (context, event: SearchUpdatedEvent) => window.history.pushState({ page: '' }, '', `search/${encodeURIComponent(event.searchTerm)}`),
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
                  searchTerm: event.searchTerm||(window.location.pathname.split('/search/')[1]||''),
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
            entry: log('entered OBJECT state'),
            id: AppFeatureStates.OBJECT,
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
            invoke: {
              id: AppActors.OBJECT_MACHINE,
              src: objectMachine(objectStore),
              data: (context) => ({
                collections: context.collections,
              }),
              onError: {
                actions: send((context, event) => event),
              },
            },
          },
        },
      },
    },
  });
