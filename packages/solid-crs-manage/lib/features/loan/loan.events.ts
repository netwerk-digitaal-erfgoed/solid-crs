import { LoanRequest } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { EventObject } from 'xstate';

export enum LoanEvents {
  CLICKED_LOANREQUEST_OVERVIEW = '[LoanEvent: Clicked LoanRequest Overview]',
  CLICKED_LOANREQUEST_DETAIL = '[LoanEvent: Clicked LoanRequest Detail]',
  CLICKED_ACCEPTED_LOANREQUEST = '[LoanEvent: Clicked Accepted LoanRequest]',
  CLICKED_REJECTED_LOANREQUEST = '[LoanEvent: Clicked Rejected LoanRequest]',
  CLICKED_NEW_LOANREQUEST = '[LoanEvent: Clicked New LoanRequest]',
  CLICKED_SEND_LOANREQUEST = '[LoanEvent: Clicked Send LoanRequest]',
}

/**
 * Fired when the user wants to view an overview of all requests
 */
export class ClickedLoanRequestOverviewEvent implements EventObject {

  public type: LoanEvents.CLICKED_LOANREQUEST_OVERVIEW = LoanEvents.CLICKED_LOANREQUEST_OVERVIEW;

}

/**
 * Fired when the user wants to view the details of a specific request
 */
export class ClickedLoanRequestDetailEvent implements EventObject {

  public type: LoanEvents.CLICKED_LOANREQUEST_DETAIL = LoanEvents.CLICKED_LOANREQUEST_DETAIL;
  constructor(public loanRequest: LoanRequest) {}

}

/**
 * Fired when the user accepts an incoming request
 */
export class ClickedAcceptedLoanRequestEvent implements EventObject {

  public type: LoanEvents.CLICKED_ACCEPTED_LOANREQUEST = LoanEvents.CLICKED_ACCEPTED_LOANREQUEST;
  constructor(public loanRequest: LoanRequest) {}

}

/**
 * Fired when the user rejects an incoming request
 */
export class ClickedRejectedLoanRequestEvent implements EventObject {

  public type: LoanEvents.CLICKED_REJECTED_LOANREQUEST = LoanEvents.CLICKED_REJECTED_LOANREQUEST;
  constructor(public loanRequest: LoanRequest) {}

}

/**
 * Fired when the user wants to start creating a new request
 */
export class ClickedNewLoanRequestEvent implements EventObject {

  public type: LoanEvents.CLICKED_NEW_LOANREQUEST = LoanEvents.CLICKED_NEW_LOANREQUEST;

}

/**
 * Fired when the user wants to finalize and send the request they have just created
 */
export class ClickedSendLoanRequestEvent implements EventObject {

  public type: LoanEvents.CLICKED_SEND_LOANREQUEST = LoanEvents.CLICKED_SEND_LOANREQUEST;
  constructor(public loanRequest: LoanRequest) {}

}

export type LoanEvent =
  | ClickedLoanRequestOverviewEvent
  | ClickedLoanRequestDetailEvent
  | ClickedAcceptedLoanRequestEvent
  | ClickedRejectedLoanRequestEvent
  | ClickedNewLoanRequestEvent
  | ClickedSendLoanRequestEvent;
