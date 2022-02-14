export interface LoanRequest {
  /**
   * The uri of the request
   */
  uri: string;
  /**
   *
   */
  type: 'https://www.w3.org/ns/activitystreams#Reject' | 'https://www.w3.org/ns/activitystreams#Offer';
  /**
   * The uri of the requested collection
   */
  collection: string;
  /**
   * UNIX timestamp of when the request was created
   */
  createdAt: string;
  /**
   * WebID of the institution sending the request
   */
  from: string;
  /**
   * WebID of the institution receiving the request
   */
  to: string;
  /**
   * An optional note for the receiving institution
   */
  description?: string;
  /**
   * Indicates if the request is accepted or not
   * Optional: when this parameter is undefined, the request is pending / neither accepted or rejected
   */
  accepted?: boolean;
}
