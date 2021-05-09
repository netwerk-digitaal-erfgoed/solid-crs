import { assign, createMachine, sendParent } from 'xstate';
import { Collection, CollectionObject, CollectionObjectStore, Store } from '@digita-ai/nde-erfgoed-core';
import { FormEvents, State } from '@digita-ai/nde-erfgoed-components';
import { of } from 'rxjs';
import { AppEvents } from '../../app.events';
import { CollectionEvent, CollectionEvents  } from './collection.events';

/**
 * The context of a collections feature.
 */
export interface CollectionContext {
  /**
   * The currently selected collection.
   */
  collection: Collection;

  /**
   * The list of objects in the current collection.
   */
  objects?: CollectionObject[];
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
  IDLE      = '[CollectionsState: Idle]',
  LOADING   = '[CollectionsState: Loading]',
  SAVING    = '[CollectionsState: Saving]',
  EDITING   = '[CollectionsState: Editing]',
  DELETING  = '[CollectionsState: Deleting]',
}

/**
 * The collection component machine.
 */
export const collectionMachine = (collectionStore: Store<Collection>, objectStore: CollectionObjectStore) =>
  createMachine<CollectionContext, CollectionEvent, State<CollectionStates, CollectionContext>>({
    id: CollectionActors.COLLECTION_MACHINE,
    initial: CollectionStates.LOADING,
    on: {
      [CollectionEvents.CLICKED_EDIT]: CollectionStates.EDITING,
      [CollectionEvents.CLICKED_DELETE]: CollectionStates.DELETING,
      [CollectionEvents.CANCELLED_EDIT]: CollectionStates.IDLE,
      [AppEvents.SELECTED_COLLECTION]: CollectionStates.LOADING,
    },
    states: {
      [CollectionStates.IDLE]: {

      },
      [CollectionStates.LOADING]: {
        invoke: {
          src: (context) => objectStore.getObjectsForCollection(context.collection).toPromise(),
          onDone: {
            actions: assign({
              objects: (context, event) => event.data,
            }),
            target: CollectionStates.IDLE,
          },
          onError: {
            actions: sendParent(AppEvents.ERROR),
          },
        },
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
          [FormEvents.FORM_SUBMITTED]: CollectionStates.SAVING,
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
