import { assign, createMachine, sendParent } from 'xstate';
import { Collection, CollectionObject, CollectionObjectStore, CollectionStore } from '@digita-ai/nde-erfgoed-core';
import { State } from '@digita-ai/nde-erfgoed-components';
import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { SearchEvent, SearchEvents  } from './search.events';
import { AppEvents } from 'app.events';

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
}

/**
 * The search component machine.
 */
export const searchMachine = (collectionStore: CollectionStore, objectStore: CollectionObjectStore) =>
  createMachine<SearchContext, SearchEvent, State<SearchStates, SearchContext>>({
    id: SearchActors.SEARCH_MACHINE,
    context: { },
    initial: SearchStates.IDLE,
    on: {
      [SearchEvents.SEARCH_UPDATED]: {
        actions: assign({
          searchTerm: (context, event) => event.searchTerm,
        }),
        target: SearchStates.SEARCHING,
      },
    },
    states: {
      [SearchStates.IDLE]: {},
      [SearchStates.SEARCHING]: {
        invoke: {
          src: (context, event) => of({ searchTerm: event.searchTerm }).pipe(
            switchMap((data) => of(objectStore.search(data.searchTerm))
              .pipe(map((objects) => ({ ...data, objects })))),
            switchMap((data) => of(collectionStore.search(data.searchTerm))
              .pipe(map((collections) => ({ ...data, collections })))),
          ),
          onDone: {
            actions: assign({
              objects: (context, event) => event.data.objects,
              collections: (context, event) => event.data.collections,
            }),
            target: SearchStates.IDLE,
          },
          onError: {
            actions: sendParent(AppEvents.ERROR),
          },
        },
      },
    },
  });
