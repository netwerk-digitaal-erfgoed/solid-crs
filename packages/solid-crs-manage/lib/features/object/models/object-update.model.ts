export interface ObjectUpdate {
  /**
   * The URI of the notification
   */
  uri: string;
  /**
   * The URI of the original object
   */
  originalObject: string;
  /**
   * The URI of the updated object
   */
  updatedObject: string;
  /**
   * WebID of the institution sending the request
   */
  from: string;
  /**
   * WebID of the institution receiving the request
   */
  to: string;
}
