import { Resource } from '../stores/resource';
import { Term } from '../terms/term';

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
   * The additional, more specific type(s) of the object.
   */
  additionalType?: Term[];

  /**
   * The identifier of the object.
   */
  identifier?: string;

  /**
   * The title of the object.
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
   * The creator(s) of the object.
   */
  creator?: Term[];

  /**
   * The creation date of the object.
   */
  dateCreated?: string;

  /**
   * The creation location of the object.
   */
  locationCreated?: Term[];

  /**
   * The material(s) of the object.
   */
  material?: Term[];

  // REPRESENTATION

  /**
   * The subject(s) of the object.
   */
  subject?: Term[];

  /**
   * The location(s) of the object.
   */
  location?: Term[];

  /**
   * The person(s) of the object.
   */
  person?: Term[];

  /**
   * The organization(s) of the object.
   */
  organization?: Term[];

  /**
   * The event(s) of the object.
   */
  event?: Term[];

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
   * The image file to be uploaded to the pod
   */
  imageFile?: File;

  /**
   * A link to the digital representation of this object.
   */
  mainEntityOfPage?: string;

  /**
   * The license of this object
   */
  license?: string;

  // LOAN

  /**
   * For original objects, the loaned version(s) of the object.
   */
  loaned?: string[];

  /**
   * For loaned objects, a reference to the original object.
   */
  original?: string;
}
