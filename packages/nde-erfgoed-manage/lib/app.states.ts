import { StateSchema } from 'xstate';
import { AppContext } from './app.context';

/**
 * State references for the application root, with readable log format.
 */
export enum AppStates {
  AUTHENTICATE = '[AppState: Authenticate]',
  COLLECTIONS  = '[AppState: Collections]',
}

/**
 * State schema for the application root, laying out the bare structure.
 */
export interface AppSchema extends StateSchema<AppContext> {
  states: {
    [AppStates.AUTHENTICATE]: unknown;
    [AppStates.COLLECTIONS]: unknown;
  };
}

/**
 * Union type of the states for the application root, with their context typing.
 */
export type AppState =
  | {
    value: AppStates.AUTHENTICATE;
    context: AppContext;
  }
  | {
    value: AppStates.AUTHENTICATE;
    context: AppContext;
  };
