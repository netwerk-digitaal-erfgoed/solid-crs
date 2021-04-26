import { StateSchema } from 'xstate';
import { AuthenticateContext } from './authenticate.context';

/**
 * State references for the collection component, with readable log format.
 */
export enum AuthenticateStates {
  AUTHENTICATED    = '[AuthenticateState: Authenticated]',
  AUTHENTICATING = '[AuthenticateState: Authenticating]',
  UNAUTHENTICATED  = '[AuthenticateState: Unauthenticated]',
}

/**
 * State schema for the collection component, laying out the bare structure.
 */
export interface AuthenticateSchema extends StateSchema<AuthenticateContext> {
  states: {
    [AuthenticateStates.AUTHENTICATED]: unknown;
    [AuthenticateStates.AUTHENTICATING]: unknown;
    [AuthenticateStates.UNAUTHENTICATED]: unknown;
  };
}

/**
 * Union type of the states for the collection component, with their context typing.
 */
export type AuthenticateState =
  | {
    value: AuthenticateStates.AUTHENTICATED;
    context: AuthenticateContext;
  }
  | {
    value: AuthenticateStates.AUTHENTICATING;
    context: AuthenticateContext;
  }
  | {
    value: AuthenticateStates.UNAUTHENTICATED;
    context: AuthenticateContext;
  };
