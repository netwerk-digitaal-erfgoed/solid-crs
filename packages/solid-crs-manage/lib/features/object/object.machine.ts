import { formMachine,
  FormActors,
  FormValidatorResult,
  FormContext,
  FormEvents, State } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { assign, createMachine, sendParent } from 'xstate';
import { Collection, CollectionObject, CollectionObjectStore } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import edtf from 'edtf';
import { AppEvents } from '../../app.events';
import { ObjectEvent, ObjectEvents } from './object.events';

/**
 * The context of the object feature.
 */
export interface ObjectContext {
  /**
   * The currently selected object.
   */
  object?: CollectionObject;
  /**
   * A list of all collections.
   */
  collections?: Collection[];
}

/**
 * Actor references for this machine config.
 */
export enum ObjectActors {
  OBJECT_MACHINE = 'ObjectMachine',
}

/**
 * State references for the object machine, with readable log format.
 */
export enum ObjectStates {
  IDLE      = '[ObjectsState: Idle]',
  SAVING    = '[ObjectsState: Saving]',
  EDITING   = '[ObjectsState: Editing]',
  DELETING  = '[ObjectsState: Deleting]',
}

/**
 * Validate the values of a collection object
 *
 * @param context the context of the object to be validated
 * @returns a list of validator results
 */
export const validateObjectForm = async (context: FormContext<CollectionObject>): Promise<FormValidatorResult[]> => {

  const res = [];

  // the description of an object can not be longer than 10.000 characters
  if (context.data.description && context.data.description.length > 10000) {

    res.push({
      field: 'description',
      message: 'nde.features.object.card.identification.field.description.validation.max-characters',
    });

  }

  // the name/title of an object can not be empty
  if (!context.data.name) {

    res.push({
      field: 'name',
      message: 'nde.features.object.card.common.empty',
    });

  }

  // the name/title of an object can not be longer than 100 characters
  if (context.data.name && context.data.name.length > 100) {

    res.push({
      field: 'name',
      message: 'nde.features.object.card.identification.field.title.validation.max-characters',
    });

  }

  // the identifier of an object can not be empty
  if (!context.data.identifier) {

    res.push({
      field: 'identifier',
      message: 'nde.features.object.card.common.empty',
    });

  }

  // the image url should be valid and return png/jpeg mime type
  if (context.data.image) {

    try {

      const contentTypes = [
        'image/png',
        'image/jpeg',
      ];

      const url = new URL(context.data.image);

      const response = await fetch(context.data.image, { method: 'HEAD' });

      if (!response.ok || !contentTypes.includes(response.headers.get('Content-Type').toLowerCase())) {

        throw Error();

      }

    } catch (error) {

      res.push({
        field: 'image',
        message: 'nde.features.object.card.image.field.file.validation.invalid',
      });

    }

  }

  // the date should be valid EDTF
  try {

    const parsed = edtf.parse(context.data.dateCreated);

  } catch (error) {

    res.push({
      field: 'dateCreated',
      message: 'nde.features.object.card.creation.field.date.validation.invalid',
    });

  }

  return res;

};

/**
 * The object machine.
 */
export const objectMachine = (objectStore: CollectionObjectStore) =>
  createMachine<ObjectContext, ObjectEvent, State<ObjectStates, ObjectContext>>({
    id: ObjectActors.OBJECT_MACHINE,
    context: { },
    initial: ObjectStates.IDLE,
    on: {
      [ObjectEvents.SELECTED_OBJECT]: {
        actions: assign({
          object: (context, event) => event.object,
        }),
        target: ObjectStates.IDLE,
      },
    },
    states: {
      [ObjectStates.SAVING]: {
        invoke: {
          src: (context, event) => objectStore.save(context.object),
          onDone: ObjectStates.IDLE,
          onError: {
            actions: sendParent(AppEvents.ERROR),
          },
        },
      },
      [ObjectStates.IDLE]: {
        on: {
          [ObjectEvents.CLICKED_SAVE]: ObjectStates.SAVING,
          [ObjectEvents.CLICKED_DELETE]: ObjectStates.DELETING,
          [FormEvents.FORM_SUBMITTED]: ObjectStates.SAVING,
          [ObjectEvents.CLICKED_RESET]: ObjectStates.IDLE,
        },
        invoke: [
          {
            id: FormActors.FORM_MACHINE,
            src: formMachine<CollectionObject>(
              (context) => validateObjectForm(context),
              async (c: FormContext<CollectionObject>) => c.data
            ),
            data: (context) => ({
              data: { ...context.object },
              original: { ...context.object },
            }),
            onDone: {
              target: ObjectStates.SAVING,
              actions: [
                assign((context, event) => ({
                  object: { ...event.data.data },
                })),
              ],
            },
          },
        ],
      },
      [ObjectStates.DELETING]: {
        invoke: {
          src: (context) => objectStore.delete(context.object),
          onDone: {
            target: ObjectStates.IDLE,
            actions: [
              sendParent((context) => ({ type: ObjectEvents.CLICKED_DELETE, object: context.object })),
            ],
          },
          onError: {
            actions: sendParent(AppEvents.ERROR),
          },
        },
      },
    },
  });
