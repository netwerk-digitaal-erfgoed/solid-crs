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
   * The description of the heritage institution.
   */
  description?: string;
  /**
   * The website of the heritage institution.
   */
  website?: string;
}
