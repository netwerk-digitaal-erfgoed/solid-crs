import { EventObject } from 'xstate';

/**
 * Represents an event.
 */
export interface Event<TEvents extends string> extends EventObject {
  /**
   * The type of the event.
   */
  type: TEvents;
}
