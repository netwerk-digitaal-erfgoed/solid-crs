import { Event } from '@digita-ai/nde-erfgoed-components';

export enum SearchEvents {
  SEARCH_UPDATED = '[SearchEvents: Updated Search]',
}

export interface SearchUpdatedEvent extends Event<SearchEvents> {
  type: SearchEvents.SEARCH_UPDATED;
  searchTerm: string;
}

export type SearchEvent = SearchUpdatedEvent;
