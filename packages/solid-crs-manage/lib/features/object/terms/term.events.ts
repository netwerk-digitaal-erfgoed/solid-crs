import { Term, TermSource } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { EventObject } from 'xstate';

/**
 * Event references for the term machine, with readable log format.
 */
export enum TermEvents {
  CLICKED_SUBMIT  = '[TermEvent: Clicked Submit]',
  CLICKED_TERM    = '[TermEvent: Clicked Term]',
  QUERY_UPDATED   = '[TermEvent: Query Updated]',
}

/**
 * Fired when the user clicks the submit button.
 */
export class ClickedSubmitEvent implements EventObject {

  public type: TermEvents.CLICKED_SUBMIT = TermEvents.CLICKED_SUBMIT;

}

/**
 * Fired when the user clicks a Term search result.
 */
export class ClickedTermEvent implements EventObject {

  public type: TermEvents.CLICKED_TERM = TermEvents.CLICKED_TERM;
  constructor(public term: Term) { }

}

/**
 * Fired when the user changes the input of the Term search inputs.
 */
export class QueryUpdatedEvent implements EventObject {

  public type: TermEvents.QUERY_UPDATED = TermEvents.QUERY_UPDATED;
  constructor(public query: string, public sources: TermSource[]) { }

}

/**
 * Events for the term machine.
 */
export type TermEvent = ClickedSubmitEvent
| ClickedTermEvent
| QueryUpdatedEvent;
