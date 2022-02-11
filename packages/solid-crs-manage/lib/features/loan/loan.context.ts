import { SolidSDKService } from '@digita-ai/inrupt-solid-service';
import { LoanRequest, CollectionStore } from '@netwerk-digitaal-erfgoed/solid-crs-core';
export interface LoanContext {
  /**
   * Service to interact with Solid pods
   */
  solidService: SolidSDKService;
  /**
   * Service to retrieve collections from pod
   */
  collectionStore: CollectionStore;
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
