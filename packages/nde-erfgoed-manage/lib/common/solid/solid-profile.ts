import { Resource } from '@digita-ai/nde-erfgoed-core';

/**
 * Represents a profile
 */
export interface SolidProfile extends Resource {
  /**
   * The full name of the user.
   */
  name: string;
}
