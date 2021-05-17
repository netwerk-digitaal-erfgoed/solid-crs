import { assign, createMachine, sendParent } from 'xstate';
import { Collection, CollectionObject, CollectionObjectStore, CollectionStore } from '@digita-ai/nde-erfgoed-core';
import { State } from '@digita-ai/nde-erfgoed-components';
import { from, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { log } from 'xstate/lib/actions';
import { SearchEvent, SearchEvents  } from './search.events';
import { AppEvents } from './../../app.events';

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
    initial: SearchStates.SEARCHING,
    states: {
      [SearchStates.IDLE]: { },
      [SearchStates.SEARCHING]: {
        invoke: {
          src: (context, event) => of({ searchTerm: context.searchTerm }).pipe(
            tap((data) => console.log(data)),
            switchMap((data) => from(objectStore.search(data.searchTerm))
              .pipe(map((objects) => ({ ...data, objects })))),
            tap((data) => console.log(data)),
            switchMap((data) => from(collectionStore.search(data.searchTerm))
              .pipe(map((collections) => ({ ...data, collections })))),
            tap((data) => console.log(data)),
          ),
          onDone: {
            actions: [
              log((context, event) => 'TEST, ' + context),
              assign({
                objects: (context, event) => event?.data.objects,
                collections: (context, event) => event?.data.collections,
              }),
            ],
            target: SearchStates.IDLE,
          },
          onError: {
            actions: sendParent(AppEvents.ERROR),
          },
        },
      },
    },
  });
