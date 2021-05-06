import { createMachine } from 'xstate';
import { Collection } from '@digita-ai/nde-erfgoed-core';
import { Event, State } from '@digita-ai/nde-erfgoed-components';
import { addAlert, CollectionsEvents, addCollections, addTestCollection, replaceCollections } from './collections.events';
import { loadCollectionsService } from './collections.services';

/**
 * The context of a collections feature.
 */
export interface CollectionsContext {
  /**
   * The list of collections available to the feature.
   */
  currentCollection: Collection;
}

/**
 * Actor references for this machine config.
 */
export enum CollectionsActors {
  COLLECTIONS_MACHINE = 'CollectionMachine',
}

/**
 * State references for the collection component, with readable log format.
 */
export enum CollectionsStates {
  IDLE    = '[CollectionsState: Idle]',
  LOADING = '[CollectionsState: Loading]',
}

/**
 * The collection component machine.
 */
export const collectionsMachine = createMachine<CollectionsContext, Event<CollectionsEvents>, State<CollectionsStates, CollectionsContext>>({
  id: CollectionsActors.COLLECTIONS_MACHINE,
  initial: CollectionsStates.IDLE,
  on: {
  },
  states: {
  },
});
