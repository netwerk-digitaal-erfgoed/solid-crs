import { Collection } from '@digita-ai/nde-erfgoed-core';

/**
 * The context of a collections feature.
 */
export interface CollectionsContext {

  /**
   * The list of collections available to the feature.
   */
  collections?: Collection[];

}
