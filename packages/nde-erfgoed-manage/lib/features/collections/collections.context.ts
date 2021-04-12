import {Collection} from '@digita-ai/nde-erfgoed-core';

/**
 * Represents the state of the collections feature.
 */
export interface CollectionsContext {
  /**
   * The collections belonging to this organization.
   */
  collections: Collection[];
}
