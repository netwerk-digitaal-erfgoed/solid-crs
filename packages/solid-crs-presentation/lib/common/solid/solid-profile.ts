import { Resource } from '@netwerk-digitaal-erfgoed/solid-crs-core';

/**
 * Represents a profile
 */
export interface SolidProfile extends Resource {
  /**
   * The full name of the heritage institution.
   */
  name: string;
  /**
   * The alternative name of the heritage institution.
   */
  alternateName?: string;
  /**
   * The description of the heritage institution.
   */
  description?: string;
  /**
   * The URI of the logo of the heritage institution.
   */
  logo?: string;
  /**
   * The website of the heritage institution.
   */
  website?: string;
  /**
   * The e-mail of the heritage institution.
   */
  email?: string;
  /**
   * The telephone number of the heritage institution.
   */
  telephone?: string;
}
