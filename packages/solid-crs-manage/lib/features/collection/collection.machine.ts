import { formMachine,
  FormActors,
  FormValidatorResult,
  FormContext,
  FormEvents, State } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { assign, createMachine, sendParent } from 'xstate';
import { Collection, CollectionObject, CollectionObjectStore, CollectionStore } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { AppEvents } from '../../app.events';
import { ObjectEvents } from '../object/object.events';
import { CollectionEvent, CollectionEvents } from './collection.events';

/**
 * The context of the collection feature.
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
 * State references for the collection machine, with readable log format.
 */
export enum CollectionStates {
  IDLE      = '[CollectionsState: Idle]',
  LOADING   = '[CollectionsState: Loading]',
  SAVING    = '[CollectionsState: Saving]',
  EDITING   = '[CollectionsState: Editing]',
  DELETING  = '[CollectionsState: Deleting]',
  DETERMINING_COLLECTION  = '[CollectionsState: Determining collection]',
  CREATING_OBJECT  = '[CollectionsState: Creating object]',
}

/**
 * Validate the name and description of a collection
 *
 * @param context the context of the object to be validated
 * @returns a list of validator results
 */
export const validateCollectionForm = async (context: FormContext<Collection>): Promise<FormValidatorResult[]> => {

  const res: FormValidatorResult[]  = [];

  // only validate dirty fields
  const dirtyFields = Object.keys(context.data).filter((field) =>
    context.data[field as keyof Collection] !== context.original[field as keyof Collection]);

  for (const field of dirtyFields) {

    const value = context.data[field as keyof Collection];

    // the name/title of an object can not be empty
    if (field === 'name' && !value) {

      res.push({
        field: 'name',
        message: 'nde.features.object.card.common.empty',
      });

    }

  }

  return res;

};

/**
 * The collection machine.
 */
export const collectionMachine =
  (collectionStore: CollectionStore, objectStore: CollectionObjectStore, objectTemplate: CollectionObject) =>
    createMachine<CollectionContext, CollectionEvent, State<CollectionStates, CollectionContext>>({
      id: CollectionActors.COLLECTION_MACHINE,
      context: { },
      initial: CollectionStates.DETERMINING_COLLECTION,
      on: {
        [CollectionEvents.SELECTED_COLLECTION]: [ {
          actions: assign({
            collection: (context, event) => event.collection,
          }),
          target: CollectionStates.DETERMINING_COLLECTION,
          cond: (context, event) => event.collection?.uri !== context.collection?.uri,
        } ],
      },
      states: {
      /**
       * Loads the objects associated with the current collection.
       */
        [CollectionStates.LOADING]: {

          invoke: {
            src: (context) =>
              objectStore.getObjectsForCollection(context.collection),
            onDone: {
            /**
             * When done, assign objects to the context and transition to idle.
             */
              actions: assign({
                objects: (context, event) => event.data.sort(
                  (a: CollectionObject, b: CollectionObject) => a.name?.localeCompare(b.name)
                ),
              }),
              target: CollectionStates.IDLE,
            },
            onError: {
            /**
             * Notify the parent machine when something goes wrong.
             */
              actions: sendParent((context, event) => ({ type: AppEvents.ERROR, data: event.data })),
            },
          },
        },
        /**
         * Determining collection
         */
        [CollectionStates.DETERMINING_COLLECTION]: {
          always: [
            {
              // only load object when the current collection's disctribution does
              // not match the context's objects (== new collection selected)
              target: CollectionStates.LOADING,
              cond: (context, event) =>
                context.collection
                  && (
                    !!context.objects
                    || !context.objects?.length
                    || context.objects[0].collection !== context.collection.uri
                  ),
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
          on: {
            [ObjectEvents.SELECTED_OBJECT]: {
              actions: sendParent((context, event) => event),
            },
            [CollectionEvents.CLICKED_CREATE_OBJECT]: CollectionStates.CREATING_OBJECT,
            [CollectionEvents.CLICKED_DELETE]: CollectionStates.DELETING,
            [CollectionEvents.CLICKED_EDIT]: CollectionStates.EDITING,
            [ObjectEvents.CLICKED_DELETE]: {
              actions: sendParent((context, event) => event),
            },
          },
        },
        /**
         * Saving changesto the collection's metadata.
         */
        [CollectionStates.SAVING]: {
          invoke: {
            src: (context) => collectionStore.save(context.collection),
            onDone: {
              target: CollectionStates.DETERMINING_COLLECTION,
              actions: [
                sendParent(() => ({ type: CollectionEvents.SAVED_COLLECTION })),
              ],
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
            [CollectionEvents.CLICKED_SAVE]: CollectionStates.SAVING,
            [CollectionEvents.CANCELLED_EDIT]: CollectionStates.IDLE,
            [FormEvents.FORM_SUBMITTED]: CollectionStates.SAVING,
            [ObjectEvents.SELECTED_OBJECT]: {
              actions: sendParent((context, event) => event),
            },
            [CollectionEvents.CLICKED_CREATE_OBJECT]: CollectionStates.CREATING_OBJECT,
            [CollectionEvents.CLICKED_DELETE]: CollectionStates.DELETING,
          },
          invoke: [
          /**
           * Invoke a form machine which controls the form.
           */
            {
              id: FormActors.FORM_MACHINE,
              src: formMachine<{ name: string; description: string }>(
                validateCollectionForm,
                async (c: FormContext<{ name: string; description: string }>) => c.data
              ),
              data: (context) => ({
                data: { name: context.collection.name, description: context.collection.description },
                original: { name: context.collection.name, description: context.collection.description },
              }),
              onDone: {
                target: CollectionStates.SAVING,
                actions: [
                  assign((context, event) => ({
                    collection: {
                      ...context.collection,
                      name: event.data.data.name,
                      description: event.data.data.description,
                    },
                  })),
                ],
              },
              onError: {
                target: CollectionStates.IDLE,
              },
            },
          ],
        },
        /**
         * Deleting the current collection.
         */
        [CollectionStates.DELETING]: {
          invoke: {
            src: (context) => collectionStore.delete(context.collection),
            onDone: {
              target: CollectionStates.IDLE,
              actions: [
                sendParent((context) => ({ type: CollectionEvents.CLICKED_DELETE, collection: context.collection })),
              ],
            },
            onError: {
              actions: sendParent(AppEvents.ERROR),
            },
          },
        },
        /**
         * Creating a new object.
         */
        [CollectionStates.CREATING_OBJECT]: {
          invoke: {
          /**
           * Save object to the store.
           */
            src: (context) => objectStore.save({ ...objectTemplate, collection: context.collection.uri }),
            onDone: {
              actions: sendParent((context, event) => ({ type: ObjectEvents.SELECTED_OBJECT, object: event.data })),
            },
            onError: {
              actions: sendParent(AppEvents.ERROR),
            },
          },
        },
      },
    });
