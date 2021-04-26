import { StateSchema } from 'xstate';
import { AppContext } from './app.context';
import { AuthenticateContext } from './features/authenticate/authenticate.context';
import { AuthenticateSchema, AuthenticateState, AuthenticateStates } from './features/authenticate/authenticate.states';

/**
 * State references for the application's features, with readable log format.
 */
export enum FeatureStates {
  AUTHENTICATE = '[FeatureState: Authenticate]',
  COLLECTIONS  = '[FeatureState: Collections]',
}

/**
 * State schema for the application's features, laying out the bare structure.
 */
export interface FeatureSchema extends StateSchema<AppContext> {
  states: {
    [FeatureStates.AUTHENTICATE]: unknown;
    [FeatureStates.COLLECTIONS]: unknown;
  };
}

/**
 * State references for the application root, with readable log format.
 */
export enum AppStates {
  AUTHENTICATE = '[AppState: Authenticate]',
  FEATURE  = '[AppState: Features]',
}

/**
 * State schema for the application root, laying out the bare structure.
 */
export interface AppSchema extends StateSchema<AppContext | AuthenticateContext> {
  states: {
    [AppStates.AUTHENTICATE]: AuthenticateSchema;
    [AppStates.FEATURE]: FeatureSchema;
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
   value: AppStates.FEATURE;
   context: AppContext;
 };
