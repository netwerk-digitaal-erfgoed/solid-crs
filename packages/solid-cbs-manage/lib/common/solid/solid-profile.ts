import { Resource } from '@netwerk-digitaal-erfgoed/solid-cbs-core';

/**
 * Represents a profile
 */
export interface SolidProfile extends Resource {
  /**
   * The full name of the user.
   */
  name: string;
}
