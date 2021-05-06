import { createMachine } from 'xstate';
import { Collection } from '@digita-ai/nde-erfgoed-core';
import { Event, FormEvents, State } from '@digita-ai/nde-erfgoed-components';
import { CollectionsEvents  } from './collection.events';

/**
 * The context of a collections feature.
 */
export interface CollectionContext {
  /**
   * The list of collections available to the feature.
   */
  currentCollection: Collection;
}

/**
 * Actor references for this machine config.
 */
export enum CollectionActors {
  COLLECTION_MACHINE = 'CollectionMachine',
}

/**
 * State references for the collection component, with readable log format.
 */
export enum CollectionStates {
  IDLE    = '[CollectionsState: Idle]',
  SAVING = '[CollectionsState: Saving]',
  EDITING = '[CollectionsState: Editing]',
  DELETING = '[CollectionsState: Deleting]',
}

/**
 * The collection component machine.
 */
export const collectionMachine = createMachine<CollectionContext, Event<CollectionsEvents>, State<CollectionStates, CollectionContext>>({
  id: CollectionActors.COLLECTION_MACHINE,
  initial: CollectionStates.IDLE,
  on: {
    [CollectionsEvents.CLICKED_EDIT]: CollectionStates.EDITING,
    [CollectionsEvents.CLICKED_DELETE]: CollectionStates.DELETING,
    [CollectionsEvents.CANCELLED_EDIT]: CollectionStates.IDLE,
  },
  states: {
    [CollectionStates.IDLE]: {

    },
    [CollectionStates.SAVING]: {

    },
    [CollectionStates.EDITING]: {
      // invoke: {
      //   // form machine
      //   src: null,
      //   onDone: CollectionStates.SAVING,
      // },

    },
    [CollectionStates.DELETING]: {

    },
  },
});
