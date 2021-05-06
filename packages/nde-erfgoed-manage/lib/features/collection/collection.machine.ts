import { createMachine, sendParent, StateMachine } from 'xstate';
import { Collection, Store } from '@digita-ai/nde-erfgoed-core';
import { Event, FormEvents, State } from '@digita-ai/nde-erfgoed-components';
import { of } from 'rxjs';
import { AppEvents } from '../../app.events';
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
export const collectionMachine = (collectionStore: Store<Collection>) =>
  createMachine<CollectionContext, Event<CollectionsEvents>, State<CollectionStates, CollectionContext>>({
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
        invoke: {
          src: () => of('store.save').toPromise(),
          onDone: {
            target: CollectionStates.IDLE,
          },
          onError: {
            actions: sendParent(AppEvents.ERROR),
          },
        },
      },
      [CollectionStates.EDITING]: {
        on: {
          [FormEvents.FORM_SUBMITTED as any]: CollectionStates.SAVING,
        },
      },
      [CollectionStates.DELETING]: {
        invoke: {
          src: () => of('store.delete').toPromise(),
          onDone: {
            target: CollectionStates.IDLE,
          },
          onError: {
            actions: sendParent(AppEvents.ERROR),
          },
        },
      },
    },
  });
