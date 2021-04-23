import { EventObject } from 'xstate';

export interface Event<TEvents extends string> extends EventObject {
  type: TEvents;
}
