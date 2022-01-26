import { StateSchema } from 'xstate';
import { LoanContext, WithRequest, WithRequests } from './loan.context';

export enum LoanStates {
  /**
   * Initial state: retrieving requests from main inbox
   */
  LOADING_LOAN_REQUESTS = '[LoanState: Loading Loan Requests]',
  /**
   * The user is viewing all incoming requests
   */
  LOAN_REQUEST_OVERVIEW = '[LoanState: Loan Request Overview]',
  /**
   * The user is viewing a single incoming request
   */
  LOAN_REQUEST_DETAIL = '[LoanState: Loan Request Detail]',
  /**
   * The user is creating a new loan request
   */
  CREATING_LOAN_REQUEST = '[LoanState: Creating Loan Request]',
  /**
   * A request is being sent
   */
  SENDING_LOAN_REQUEST = '[LoanState: Sending Loan Request]',
  /**
   * The user has accepted a request and relevant code is being executed
   */
  ACCEPTING_LOAN_REQUEST = '[LoanState: Accepting Loan Request]',
  /**
   * The user has rejected a request and the relevant code being executed
   */
  REJECTING_LOAN_REQUEST = '[LoanState: Rejecting Loan Request]',
}

export type LoanState = {
  // While loading no values are present in the context
  value: LoanStates.LOADING_LOAN_REQUESTS;
  context: LoanContext;
} | {
  value:
  | LoanStates.LOAN_REQUEST_OVERVIEW
  | LoanStates.ACCEPTING_LOAN_REQUEST
  | LoanStates.REJECTING_LOAN_REQUEST
  | LoanStates.CREATING_LOAN_REQUEST
  | LoanStates.SENDING_LOAN_REQUEST;
  context: LoanContext & WithRequests;
} | {
  value: LoanStates.LOAN_REQUEST_DETAIL;
  context: LoanContext & WithRequests & WithRequest;
};

export interface LoanStateSchema extends StateSchema<LoanContext> {
  states: {
    [key in LoanStates]?: StateSchema<LoanContext>;
  };
}
