import { formMachine,
  FormActors,
  FormValidatorResult,
  FormContext,
  FormEvents, State } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { assign, createMachine, sendParent } from 'xstate';
import { Collection, CollectionObject, CollectionObjectStore, TermService } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import edtf from 'edtf';
import { log } from 'xstate/lib/actions';
import { AppEvents } from '../../app.events';
import { ClickedTermFieldEvent, ObjectEvent, ObjectEvents } from './object.events';
import { TermActors, termMachine } from './terms/term.machine';

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
  /**
   * A list of all collections.
   */
  termService?: TermService;
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
  EDITING_FIELD   = '[ObjectsState: Editing Field]',
  DELETING  = '[ObjectsState: Deleting]',
}

/**
 * Validate the values of a collection object
 *
 * @param context the context of the object to be validated
 * @returns a list of validator results
 */
export const validateObjectForm = async (context: FormContext<CollectionObject>): Promise<FormValidatorResult[]> => {

  const res: FormValidatorResult[]  = [];

  // only validate dirty fields
  const dirtyFields = Object.keys(context.data).filter((field) =>
    context.data[field as keyof CollectionObject] !== context.original[field as keyof CollectionObject]);

  for (const field of dirtyFields) {

    const value = context.data[field as keyof CollectionObject];

    // the description of an object can not be longer than 10.000 characters
    if (field === 'description' && value && (value as typeof context.data[typeof field]).length > 10000) {

      res.push({
        field,
        message: 'nde.features.object.card.identification.field.description.validation.max-characters',
      });

    }

    // the name/title of an object can not be empty
    if (field === 'name' && !value) {

      res.push({
        field,
        message: 'nde.features.object.card.common.empty',
      });

    }

    // the name/title of an object can not be longer than 100 characters
    if (field === 'name' && value && (value as typeof context.data[typeof field]).length > 100) {

      res.push({
        field,
        message: 'nde.features.object.card.identification.field.title.validation.max-characters',
      });

    }

    // the identifier of an object can not be empty
    if (field === 'identifier' && !value) {

      res.push({
        field,
        message: 'nde.features.object.card.common.empty',
      });

    }

    if (field === 'type') {

      // the type of an object can not be empty
      if (!value) {

        res.push({
          field,
          message: 'nde.features.object.card.common.empty',
        });

      } else {

        // the type must be a valid URL
        try {

          new URL(value as typeof context.data[typeof field]);

        } catch {

          res.push({
            field,
            message: 'nde.features.object.card.common.invalid-url',
          });

        }

      }

    }

    // the additionalType of an object can not be empty
    if (field === 'additionalType') {

      // the additionalType of an object can not be empty
      if (!value || (value as typeof context.data[typeof field])?.length < 1) {

        res.push({
          field,
          message: 'nde.features.object.card.common.empty',
        });

      }

    }

    // the identifier of an object can not be empty
    if (field === 'image' && !value) {

      res.push({
        field,
        message: 'nde.features.object.card.common.empty',
      });

    }

    // the image url should be valid and return png/jpeg mime type
    if (field === 'image' && value) {

      try {

        new URL((value as typeof context.data[typeof field]));

      } catch (error) {

        res.push({
          field,
          message: 'nde.features.object.card.common.invalid-url',
        });

      }

    }

    // the date should be valid EDTF
    if (field === 'dateCreated' && (value as typeof context.data[typeof field])?.length > 0) {

      try {

        edtf.parse(value);

      } catch (error) {

        res.push({
          field,
          message: 'nde.features.object.card.creation.field.date.validation.invalid',
        });

      }

    }

    // validate numbers
    if ([ 'depth', 'width', 'height', 'weight' ].includes(field)) {

      if (value.toString() === 'NaN') {

        res.push({
          field,
          message: 'nde.features.object.card.common.invalid-number',
        });

      }

    }

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
          [ObjectEvents.CLICKED_TERM_FIELD]: ObjectStates.EDITING_FIELD,
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
                  object: event.data.data,
                })),
              ],
            },
          },
        ],
      },
      [ObjectStates.EDITING_FIELD]: {
        on: {
          [ObjectEvents.CLICKED_SAVE]: ObjectStates.SAVING,
          [ObjectEvents.CLICKED_DELETE]: ObjectStates.DELETING,
          [ObjectEvents.CLICKED_SIDEBAR_ITEM]: ObjectStates.IDLE,
        },
        invoke: [
          {
            id: TermActors.TERM_MACHINE,
            src: termMachine,
            data: (context, event: ClickedTermFieldEvent) => ({
              field: event.field,
              termService: context.termService || new TermService(process.env.VITE_TERM_ENDPOINT),
            }),
            onDone: {
              target: ObjectStates.SAVING,
              actions: [
                assign((context, event) => ({
                  object: {
                    ...context.object,
                    [event.data.field]: event.data.selectedTerms?.length > 0
                      ? event.data.selectedTerms[0].name[0] // todo switch to full list instead of one value
                      : context.object[event.data.field as keyof CollectionObject],
                  },
                })),
              ],
            },
            onError: {
              actions: sendParent(AppEvents.ERROR),
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
