import { Resource } from '../stores/resource';
import { Term } from './term';

/**
 * Represents a term source
 * See: https://termennetwerk.netwerkdigitaalerfgoed.nl/faq
 */
export interface TermSource extends Resource {
  /**
   * The name of the TermSource.
   */
  name: string;
  /**
   * Alternative names of this TermSource
   */
  alternateName?: string;
  /**
   * The creator(s) of this TermSource
   */
  creators: { uri: string; alternateName: string }[];
}
