
import { Event } from '@digita-ai/nde-erfgoed-components';

/**
 * Event references for the Search component, with readable log format.
 */
export enum SearchEvents {
  SEARCH_UPDATED   = '[SearchEvent: Updated element]',
  SEARCH_SUBMITTED = '[SearchEvent: Submitted]',
}

/**
 * Event interfaces for the search component, with their payloads.
 */

/**
 * Event dispatched when a search element was updated.
 */
export interface SearchUpdatedEvent extends Event<SearchEvents> {
  type: SearchEvents.SEARCH_UPDATED;
  field: string; value: string;
}

/**
 * Event dispatched when a search element was submitted.
 */
export interface SearchSubmittedEvent extends Event<SearchEvents> {
  type: SearchEvents.SEARCH_SUBMITTED;
  field: string; value: string;
}

export type SearchEvent = SearchUpdatedEvent | SearchSubmittedEvent;
