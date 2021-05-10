import { assign, createMachine, sendParent } from 'xstate';
import { Collection, CollectionObject, CollectionObjectStore, Store } from '@digita-ai/nde-erfgoed-core';
import { FormEvents, State } from '@digita-ai/nde-erfgoed-components';
import { AppEvents } from '../../app.events';
import { CollectionEvent, CollectionEvents  } from './collection.events';

/**
 * The context of a collections feature.
 */
export interface CollectionContext {
  /**
   * The currently selected collection.
   */
  collection?: Collection;

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
  DETERMINING_COLLECTION  = '[CollectionsState: Determining collection]',
}

/**
 * The collection component machine.
 */
export const collectionMachine = (collectionStore: Store<Collection>, objectStore: CollectionObjectStore) =>
  createMachine<CollectionContext, CollectionEvent, State<CollectionStates, CollectionContext>>({
    id: CollectionActors.COLLECTION_MACHINE,
    context: { },
    initial: CollectionStates.DETERMINING_COLLECTION,
    on: {
      [CollectionEvents.CLICKED_EDIT]: CollectionStates.EDITING,
      [CollectionEvents.CLICKED_DELETE]: CollectionStates.DELETING,
      [CollectionEvents.CLICKED_SAVE]: CollectionStates.SAVING,
      [CollectionEvents.CANCELLED_EDIT]: CollectionStates.IDLE,
      [AppEvents.SELECTED_COLLECTION]: {
        actions: assign({
          collection: (context, event) => event.collection,
        }),
        target: CollectionStates.DETERMINING_COLLECTION,
      },
    },
    states: {
      /**
       * Loads the objects associated with the current collection.
       */
      [CollectionStates.LOADING]: {
        invoke: {
          src: (context) => objectStore.getObjectsForCollection(context.collection),
          onDone: {
            /**
             * When done, assign objects to the context and transition to idle.
             */
            actions: assign({
              objects: (context, event) => event.data,
            }),
            target: CollectionStates.IDLE,
          },
          onError: {
            /**
             * Notify the parent machine when something goes wrong.
             */
            actions: sendParent(AppEvents.ERROR),
          },
        },
      },
      /**
       * Determining collection
       */
      [CollectionStates.DETERMINING_COLLECTION]: {
        entry: assign({
          collection: (context, event) => event.collection,
        }),
        always: [
          {
            target: CollectionStates.LOADING,
            cond: (context, event) => context?.collection ? true : false,
          },
          {
            target: CollectionStates.IDLE,
          },
        ],
      },
      /**
       * Objects for the current collection are loaded.
       */
      [CollectionStates.IDLE]: {
      },
      /**
       * Saving changesto the collection's metadata.
       */
      [CollectionStates.SAVING]: {
        invoke: {
          src: (context) => collectionStore.save(context.collection),
          onDone: {
            target: CollectionStates.IDLE,
          },
          onError: {
            actions: sendParent(AppEvents.ERROR),
          },
        },
      },
      /**
       * Editing the collection metadata.
       */
      [CollectionStates.EDITING]: {
        on: {
          [FormEvents.FORM_SUBMITTED]: CollectionStates.SAVING,
        },
      },
      /**
       * Deleting the current collection.
       */
      [CollectionStates.DELETING]: {
        invoke: {
          src: (context) => collectionStore.delete(context.collection),
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
