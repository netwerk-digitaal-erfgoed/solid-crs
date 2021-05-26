import { Resource } from '../stores/resource';

/**
 * Represents a digitally archived objects.
 */
export interface CollectionObject extends Resource {

  // IDENTIFICATION

  /**
   * The type of the object.
   */
  type: string;

  /**
   * The additionalType of the object.
   */
  additionalType?: string;

  /**
   * The identifier of the object.
   */
  identifier?: string;

  /**
   * The name of the object.
   */
  name: string;

  /**
   * The description of the object.
   */
  description: string;

  /**
   * The collection to which the object belongs.
   */
  collection: string;

  /**
   * The maintainer of the object.
   */
  maintainer?: string;

  // CREATION

  /**
   * The creator of the object.
   */
  creator?: string;

  /**
   * The creation date of the object.
   */
  dateCreated?: string;

  /**
   * The creation location of the object.
   */
  locationCreated?: string;

  /**
   * The material of the object.
   */
  material?: string;

  // REPRESENTATION

  /**
   * The subject of the object.
   */
  subject?: string;

  /**
   * The location of the object.
   */
  location?: string;

  /**
   * The person of the object.
   */
  person?: string;

  /**
   * The organization of the object.
   */
  organization?: string;

  /**
   * The event of the object.
   */
  event?: string;

  // ACQUISITION

  // TBD

  // DIMENSIONS

  /**
   * The height of the object.
   */
  height?: number;

  /**
   * The height unit of the object.
   */
  heightUnit?: string;

  /**
   * The width of the object.
   */
  width?: number;

  /**
   * The width unit of the object.
   */
  widthUnit?: string;

  /**
   * The depth of the object.
   */
  depth?: number;

  /**
   * The depth unit of the object.
   */
  depthUnit?: string;

  /**
   * The weight of the object.
   */
  weight?: number;

  /**
   * The weight unit of the object.
   */
  weightUnit?: string;

  // OTHER

  /**
   * An image of the object.
   */
  image: string;

  /**
   * A link to the digital representation of this object.
   */
  mainEntityOfPage?: string;
}
