import { Resource } from '../stores/resource';

/** Represents a digitally archived objects */
export interface CollectionObject extends Resource {
  /** The name of the object */
  name: string;
  /** The description of the object */
  description: string;
  /** An image of the object */
  image: string;
  /** The subject of the object */
  subject: string;
  /** The type of the object */
  type: string; // icon
  /** The timestamp representing when the object was updated */
  updated: number; // unix timestamp
}
