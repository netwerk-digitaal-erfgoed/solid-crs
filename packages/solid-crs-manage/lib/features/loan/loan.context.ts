import { LoanRequest } from '@netwerk-digitaal-erfgoed/solid-crs-core';

export interface LoanContext {
  /**
   * All `LoanRequest`s retrieved
   */
  loanRequests?: LoanRequest[];
  /**
   * The loan request currently being viewed in the detail page
   */
  loanRequest?: LoanRequest;
}

export interface WithRequests {
  loanRequests: LoanRequest[];
}

export interface WithRequest {
  loanRequest: LoanRequest;
}
