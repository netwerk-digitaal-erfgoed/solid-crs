
import { Event } from '@digita-ai/nde-erfgoed-components';

/**
 * Event references for the Search component, with readable log format.
 */
export enum SearchEvents {
  SEARCH   = '[SearchEvent: Search]',
}

/**
 * Event interfaces for the search component, with their payloads.
 */

/**
 * Event dispatched when a search element was updated.
 */
export interface SearchUpdatedEvent extends Event<SearchEvents> {
  type: SearchEvents.SEARCH;
}

export type SearchEvent = SearchUpdatedEvent;
