import { Event } from '@netwerk-digitaal-erfgoed/solid-crs-components';

/**
 * Event references for the search feature, with readable log format.
 */
export enum SearchEvents {
  SEARCH_UPDATED = '[SearchEvents: Updated Search]',
}

/**
 * Event fired when the search term was updated.
 */
export interface SearchUpdatedEvent extends Event<SearchEvents> {
  type: SearchEvents.SEARCH_UPDATED;
  searchTerm: string;
}

/**
 * Union type of search events.
 */
export type SearchEvent = SearchUpdatedEvent;
