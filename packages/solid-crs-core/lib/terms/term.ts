import { Resource } from '../stores/resource';

/**
 * Represents a term
 * See: https://termennetwerk.netwerkdigitaalerfgoed.nl/faq
 */
export interface Term extends Resource {
  /**
   * The name of the Term.
   */
  name: string;
  /**
   * The description of this Term
   */
  description?: string;
  /**
   * Alternative names of this Term
   */
  alternateName?: string[];
  /**
   * Hidden names
   */
  hiddenName?: string[];
  /**
   * Other Term URIs in which this Term appears
   */
  broader?: Term[];
  /**
   * Other Term URIs that are contained within this (broad) Term
   * Opposite of broader
   */
  narrower?: Term[];
  /**
   * The source the term is related to
   */
  source?: string;
}
