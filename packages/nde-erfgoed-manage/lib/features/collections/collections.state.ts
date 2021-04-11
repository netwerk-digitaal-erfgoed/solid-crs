import {Collection} from '@digita-ai/nde-erfgoed-core';

/**
 * Represents the state of the collections feature.
 */
export interface CollectionsState {
  /**
   * The collections belonging to this organization.
   */
  collections: Collection[];

  /**
   * Indicates if data is loading.
   */
  loading: boolean;
}
