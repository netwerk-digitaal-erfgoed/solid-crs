import { SolidSDKService } from '@digita-ai/inrupt-solid-service';
import { LoanRequest, CollectionStore, Collection, CollectionObjectStore } from '@netwerk-digitaal-erfgoed/solid-crs-core';
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
   * Service to retrieve object from pod
   */
  objectStore: CollectionObjectStore;
  /**
   * All `LoanRequest`s retrieved
   */
  loanRequests?: LoanRequest[];
  /**
   * The loan request currently being viewed in the detail page
   */
  loanRequest?: LoanRequest;
  /**
   * The collection belonging to the loan request currently being viewed in the detail page
   */
  collection?: Collection;
}

export interface WithRequests {
  loanRequests: LoanRequest[];
}

export interface WithRequest {
  loanRequest: LoanRequest;
  collection: Collection;
}
