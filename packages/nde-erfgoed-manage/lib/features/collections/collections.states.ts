import { StateSchema } from 'xstate';
import { CollectionsContext } from './collections.context';

/**
 * State references for the collection component, with readable log format.
 */
export enum CollectionsStates {
  IDLE    = '[CollectionsState: Idle]',
  LOADING = '[CollectionsState: Loading]',
  LOGOUT  = '[CollectionsState: Logout]',
}

/**
 * State schema for the collection component, laying out the bare structure.
 */
export interface CollectionsSchema extends StateSchema<CollectionsContext> {
  states: {
    [CollectionsStates.IDLE]: unknown;
    [CollectionsStates.LOADING]: unknown;
    [CollectionsStates.LOGOUT]: unknown;
  };
}

/**
 * Union type of the states for the collection component, with their context typing.
 */
export type CollectionsState =
  | {
    value: CollectionsStates.IDLE;
    context: CollectionsContext;
  }
  | {
    value: CollectionsStates.LOADING;
    context: CollectionsContext;
  }
  | {
    value: CollectionsStates.LOGOUT;
    context: CollectionsContext;
  };
