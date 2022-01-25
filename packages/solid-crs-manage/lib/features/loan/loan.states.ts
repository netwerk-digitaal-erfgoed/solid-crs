import { StateSchema } from 'xstate';
import { LoanContext, WithRequest, WithRequests } from './loan.context';

export enum LoanStates {
  /**
   * Initial state: retrieving requests from main inbox
   */
  LOADING_REQUESTS = '[LoanState: Loading Requests]',
  /**
   * The user is viewing all incoming requests
   */
  REQUEST_OVERVIEW = '[LoanState: Request Overview]',
  /**
   * The user is viewing a single incoming request
   */
  REQUEST_DETAIL = '[LoanState: Request Detail]',
  /**
   * The user is creating a new loan request
   */
  CREATING_REQUEST = '[LoanState: Creating Request]',
  /**
   * A request is being sent
   */
  SENDING_REQUEST = '[LoanState: Sending Request]',
  /**
   * The user has accepted a request and relevant code is being executed
   */
  ACCEPTING_REQUEST = '[LoanState: Accepting Request]',
  /**
   * The user has rejected a request and the relevant code being executed
   */
  REJECTING_REQUEST = '[LoanState: Rejecting Request]',
}

export type LoanState = {
  // While loading no values are present in the context
  value: LoanStates.LOADING_REQUESTS;
  context: LoanContext;
} | {
  value:
  | LoanStates.REQUEST_OVERVIEW
  | LoanStates.ACCEPTING_REQUEST
  | LoanStates.REJECTING_REQUEST
  | LoanStates.CREATING_REQUEST
  | LoanStates.SENDING_REQUEST;
  context: LoanContext & WithRequests;
} | {
  value: LoanStates.REQUEST_DETAIL;
  context: LoanContext & WithRequests & WithRequest;
};

export interface LoanStateSchema extends StateSchema<LoanContext> {
  states: {
    [key in LoanStates]?: StateSchema<LoanContext>;
  };
}
