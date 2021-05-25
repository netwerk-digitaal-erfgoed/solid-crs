/**
 * Represents a resource on the web.
 */
export interface Resource {
  /**
   * The identifier of the resource.
   */
  uri: string;
  /**
   * When the resource was last updated
   */
  updated?: string;
}
