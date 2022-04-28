import { Resource } from '../stores/resource';

/**
 * Represents a collection of digitally archived objects.
 */
export interface Collection extends Resource {
  /**
   * The name of the collection.
   */
  name: string;

  /**
   * The description of the collection.
   */
  description: string;

  /**
   * The URI of this collection's objects
   */
  objectsUri: string;

  /**
   * The distribution URI of this collection
   */
  distribution: string;

  /**
   * The inbox URI of this collection
   */
  inbox: string;

  /**
   * The WebID of the publisher of this collection
   */
  publisher: string;
}
