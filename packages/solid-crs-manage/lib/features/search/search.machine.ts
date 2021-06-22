import { assign, createMachine, sendParent } from 'xstate';
import { Collection, CollectionObject, CollectionObjectStore, CollectionStore } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { State } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { AppEvents } from './../../app.events';
import { SearchEvent, SearchEvents, SearchUpdatedEvent } from './search.events';

/**
 * The context of a searchs feature.
 */
export interface SearchContext {
  /**
   * The searched term
   */
  searchTerm?: string;

  /**
   * The list of objects in the current search.
   */
  objects?: CollectionObject[];

  /**
   * The list of objects in the current search.
   */
  collections?: Collection[];

  /**
   * The current (partial) path
   */
  path?: string[];
}

/**
 * Actor references for this machine config.
 */
export enum SearchActors {
  SEARCH_MACHINE = 'SearchMachine',
}

/**
 * State references for the search component, with readable log format.
 */
export enum SearchStates {
  IDLE        = '[SearchState: Idle]',
  SEARCHING   = '[SearchState: Searching]',
  DISMISSED   = '[SearchState: Dismissed]',
}

/**
 * The search component machine.
 */
export const searchMachine = (collectionStore: CollectionStore, objectStore: CollectionObjectStore) =>
  createMachine<SearchContext, SearchEvent, State<SearchStates, SearchContext>>({
    id: SearchActors.SEARCH_MACHINE,
    context: { },
    initial: SearchStates.SEARCHING,
    states: {
      /**
       * Showing search results.
       */
      [SearchStates.IDLE]: {
        on: {
          [SearchEvents.SEARCH_UPDATED]: [
            /**
             * Start searching when the term was updated when not empty.
             */
            {
              actions: [
                assign({ searchTerm: (context, event: SearchUpdatedEvent) => event.searchTerm }),
              ],
              target: SearchStates.SEARCHING,
              cond: (_, event: SearchUpdatedEvent) => event.searchTerm !== undefined && event.searchTerm !== '',
            },
            /**
             * Transition to dismissed when term is empty.
             */
            {
              actions: [
                assign({ searchTerm: (context, event: SearchUpdatedEvent) => event.searchTerm }),
              ],
              target: SearchStates.DISMISSED,
              cond: (_, event: SearchUpdatedEvent) => event.searchTerm === undefined || event.searchTerm === '',
            },
          ],
        },
      },
      /**
       * Performing a search.
       */
      [SearchStates.SEARCHING]: {
        /**
         * Search for objects and collections based on the given search term.
         */
        invoke: {
          src: async (context) => {

            const collections = await collectionStore.all();
            const objectsPromises = collections.map((col) => objectStore.getObjectsForCollection(col));
            const allObjects: CollectionObject[][] = await Promise.all(objectsPromises);
            const objects = [].concat(...allObjects);

            return {
              objects: await objectStore.search(context.searchTerm, objects),
              // collections: await collectionStore.search(context.searchTerm, collections),
            };

          },
          /**
           * When done, update context and show search results.
           */
          onDone: {
            actions: assign({
              objects: (context, event) => event?.data.objects,
              // collections: (context, event) => event?.data.collections,
            }),
            target: SearchStates.IDLE,
          },
          onError: {
            actions: sendParent(AppEvents.ERROR),
          },
        },
      },
      /**
       * Dismissed search results.
       */
      [SearchStates.DISMISSED]: {
        type: 'final',
      },
    },
  });
