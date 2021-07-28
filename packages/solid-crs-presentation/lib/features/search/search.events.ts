import { EventObject } from 'xstate';

/**
 * Event references for the search feature, with readable log format.
 */
export enum SearchEvents {
  SEARCH_UPDATED = '[SearchEvents: Updated Search]',
}

/**
 * Event fired when the search term was updated.
 */
export class SearchUpdatedEvent implements EventObject {

  public type: SearchEvents.SEARCH_UPDATED = SearchEvents.SEARCH_UPDATED;
  constructor(public searchTerm: string) { }

}

/**
 * Union type of search events.
 */
export type SearchEvent = SearchUpdatedEvent;
