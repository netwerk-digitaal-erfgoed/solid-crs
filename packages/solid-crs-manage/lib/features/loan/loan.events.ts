import { Collection, LoanRequest } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { EventObject } from 'xstate';
import { LoanRequestCreationArgs } from './models/loan-request-creation-args';

export enum LoanEvents {
  CLICKED_LOAN_REQUEST_OVERVIEW_INCOMING = '[LoanEvent: Clicked Loan Request Overview Incoming]',
  CLICKED_LOAN_REQUEST_OVERVIEW_ACCEPTED = '[LoanEvent: Clicked Loan Request Overview Accepted]',
  CLICKED_LOAN_REQUEST_DETAIL = '[LoanEvent: Clicked Loan Request Detail]',
  CLICKED_ACCEPTED_LOAN_REQUEST = '[LoanEvent: Clicked Accepted Loan Request]',
  CLICKED_REJECTED_LOAN_REQUEST = '[LoanEvent: Clicked Rejected Loan Request]',
  CLICKED_NEW_LOAN_REQUEST = '[LoanEvent: Clicked New Loan Request]',
  CLICKED_SEND_LOAN_REQUEST = '[LoanEvent: Clicked Send Loan Request]',
  CLICKED_IMPORT_COLLETION = '[LoanEvent: Clicked Import Collection]',
  COLLECTION_IMPORTED = '[LoanEvent: Collection Imported]',
}

/**
 * Fired when the user wants to view an overview of all incoming requests
 */
export class ClickedLoanRequestOverviewIncomingEvent implements EventObject {

  public type: LoanEvents.CLICKED_LOAN_REQUEST_OVERVIEW_INCOMING = LoanEvents.CLICKED_LOAN_REQUEST_OVERVIEW_INCOMING;

}

/**
 * Fired when the user wants to view an overview of all accepted requests
 */
export class ClickedLoanRequestOverviewAcceptedEvent implements EventObject {

  public type: LoanEvents.CLICKED_LOAN_REQUEST_OVERVIEW_ACCEPTED = LoanEvents.CLICKED_LOAN_REQUEST_OVERVIEW_ACCEPTED;

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
  constructor(public loanRequestCreationArgs: LoanRequestCreationArgs) {}

}

/**
 * Fired when the user clicked the import collection button
 */
export class ClickedImportCollection implements EventObject {

  public type: LoanEvents.CLICKED_IMPORT_COLLETION = LoanEvents.CLICKED_IMPORT_COLLETION;
  constructor(public collection: Collection) {}

}

/**
 * Fired when importing collection was successful
 */
export class CollectionImported implements EventObject {

  public type: LoanEvents.COLLECTION_IMPORTED = LoanEvents.COLLECTION_IMPORTED;
  constructor(public collection: Collection) {}

}

export type LoanEvent =
  | ClickedLoanRequestOverviewIncomingEvent
  | ClickedLoanRequestOverviewAcceptedEvent
  | ClickedLoanRequestDetailEvent
  | ClickedAcceptedLoanRequestEvent
  | ClickedRejectedLoanRequestEvent
  | ClickedNewLoanRequestEvent
  | ClickedSendLoanRequestEvent
  | ClickedImportCollection
  | CollectionImported;
