import { Alert, State } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { Collection, CollectionObjectStore, CollectionObject, CollectionStore } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { createMachine } from 'xstate';
import { assign, forwardTo, log, send } from 'xstate/lib/actions';
import { addAlert, AddAlertEvent, AppEvent, AppEvents, dismissAlert, setCollections } from './app.events';
import { SolidSession } from './common/solid/solid-session';
import { SolidService } from './common/solid/solid.service';
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
   * The URI of the DataCatalog in which the collections are stored
   */
  catalog?: Collection;
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
}

/**
 * Union type of all app events.
 */
export type AppStates = AppRootStates | AppFeatureStates;

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
        initial: AppFeatureStates.COLLECTION,
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
         * The collection feature is shown.
         */
          // [AppFeatureStates.AUTHENTICATE]: {},
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
       * Determines if the current user is creating a collection.
       */
      [AppRootStates.DATA]: {
        initial: AppDataStates.REFRESHING,
        states: {
          /**
           * Not refreshing or creating collections.
           */
          [AppDataStates.IDLE]: {
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
                },
              ],
              onError: {
                actions: send((context, event) => event),
              },
            },
          },
        },
      },
    },
  });
