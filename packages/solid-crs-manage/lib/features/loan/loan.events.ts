import { LoanRequest } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { EventObject } from 'xstate';

export enum LoanEvents {
  CLICKED_LOAN_REQUEST_OVERVIEW = '[LoanEvent: Clicked Loan Request Overview]',
  CLICKED_LOAN_REQUEST_DETAIL = '[LoanEvent: Clicked Loan Request Detail]',
  CLICKED_ACCEPTED_LOAN_REQUEST = '[LoanEvent: Clicked Accepted Loan Request]',
  CLICKED_REJECTED_LOAN_REQUEST = '[LoanEvent: Clicked Rejected Loan Request]',
  CLICKED_NEW_LOAN_REQUEST = '[LoanEvent: Clicked New Loan Request]',
  CLICKED_SEND_LOAN_REQUEST = '[LoanEvent: Clicked Send Loan Request]',
}

/**
 * Fired when the user wants to view an overview of all requests
 */
export class ClickedLoanRequestOverviewEvent implements EventObject {

  public type: LoanEvents.CLICKED_LOAN_REQUEST_OVERVIEW = LoanEvents.CLICKED_LOAN_REQUEST_OVERVIEW;

}

/**
 * Fired when the user wants to view the details of a specific request
 */
export class ClickedLoanRequestDetailEvent implements EventObject {

  public type: LoanEvents.CLICKED_LOAN_REQUEST_DETAIL = LoanEvents.CLICKED_LOAN_REQUEST_DETAIL;
  constructor(public loanRequest: LoanRequest) {}

}

/**
 * Fired when the user accepts an incoming request
 */
export class ClickedAcceptedLoanRequestEvent implements EventObject {

  public type: LoanEvents.CLICKED_ACCEPTED_LOAN_REQUEST = LoanEvents.CLICKED_ACCEPTED_LOAN_REQUEST;
  constructor(public loanRequest: LoanRequest) {}

}

/**
 * Fired when the user rejects an incoming request
 */
export class ClickedRejectedLoanRequestEvent implements EventObject {

  public type: LoanEvents.CLICKED_REJECTED_LOAN_REQUEST = LoanEvents.CLICKED_REJECTED_LOAN_REQUEST;
  constructor(public loanRequest: LoanRequest) {}

}

/**
 * Fired when the user wants to start creating a new request
 */
export class ClickedNewLoanRequestEvent implements EventObject {

  public type: LoanEvents.CLICKED_NEW_LOAN_REQUEST = LoanEvents.CLICKED_NEW_LOAN_REQUEST;

}

/**
 * Fired when the user wants to finalize and send the request they have just created
 */
export class ClickedSendLoanRequestEvent implements EventObject {

  public type: LoanEvents.CLICKED_SEND_LOAN_REQUEST = LoanEvents.CLICKED_SEND_LOAN_REQUEST;
  constructor(public loanRequest: LoanRequest) {}

}

export type LoanEvent =
  | ClickedLoanRequestOverviewEvent
  | ClickedLoanRequestDetailEvent
  | ClickedAcceptedLoanRequestEvent
  | ClickedRejectedLoanRequestEvent
  | ClickedNewLoanRequestEvent
  | ClickedSendLoanRequestEvent;
