import { Resource } from '@netwerk-digitaal-erfgoed/solid-crs-core';

/**
 * Represents a profile
 */
export interface SolidProfile extends Resource {
  /**
   * The full name of the user.
   */
  name: string;
}
