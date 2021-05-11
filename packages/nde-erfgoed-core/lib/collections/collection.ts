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
   * The location of this collection's objects
   */
  objectsUri: string;
}
