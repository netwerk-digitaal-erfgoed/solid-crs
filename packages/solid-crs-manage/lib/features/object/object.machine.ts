import { formMachine,
  FormActors,
  FormValidatorResult,
  FormContext,
  FormEvents, State } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { assign, createMachine, sendParent } from 'xstate';
import { Collection, CollectionObject, CollectionObjectStore, TermService } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import edtf from 'edtf';
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

    } else if (field === 'name' && !value) {

      // the name/title of an object can not be empty

      res.push({
        field,
        message: 'nde.features.object.card.common.empty',
      });

    } else if (field === 'name' && value && (value as typeof context.data[typeof field]).length > 100) {

      // the name/title of an object can not be longer than 100 characters

      res.push({
        field,
        message: 'nde.features.object.card.identification.field.title.validation.max-characters',
      });

    } else if (field === 'identifier' && !value) {

      // the identifier of an object can not be empty

      res.push({
        field,
        message: 'nde.features.object.card.common.empty',
      });

    } else if (field === 'type') {

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

    } else if (field === 'additionalType') {

      // the additionalType of an object can not be empty

      // the additionalType of an object can not be empty
      if (!value || (value as typeof context.data[typeof field])?.length < 1) {

        res.push({
          field,
          message: 'nde.features.object.card.common.empty',
        });

      }

    } else if (field === 'image' && !value) {

      // the identifier of an object can not be empty

      res.push({
        field,
        message: 'nde.features.object.card.common.empty',
      });

    } else if (field === 'image' && value) {

      // the image url should be valid and return png/jpeg mime type

      try {

        new URL((value as typeof context.data[typeof field]));

      } catch (error) {

        res.push({
          field,
          message: 'nde.features.object.card.common.invalid-url',
        });

      }

    } else if (field === 'dateCreated' && (value as typeof context.data[typeof field])?.length > 0) {

      // the date should be valid EDTF

      try {

        edtf.parse(value);

      } catch (error) {

        res.push({
          field,
          message: 'nde.features.object.card.creation.field.date.validation.invalid',
        });

      }

    } else if ([ 'depth', 'width', 'height', 'weight' ].includes(field)) {

      // validate numbers

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
            ),
            data: (context) => {

              // replace terms with lists of uri
              const formObject = {
                ...context.object,
                additionalType: context.object?.additionalType
                  ? context.object.additionalType.map((term) => term.uri) : [],
                creator: context.object?.creator ? context.object.creator.map((term) => term.uri) : [],
                locationCreated: context.object?.locationCreated
                  ? context.object.locationCreated.map((term) => term.uri) : [],
                material: context.object?.material ? context.object.material.map((term) => term.uri) : [],
                subject: context.object?.subject ? context.object.subject.map((term) => term.uri) : [],
                location: context.object?.location ? context.object.location.map((term) => term.uri) : [],
                person: context.object?.person ? context.object.person.map((term) => term.uri) : [],
                organization: context.object?.organization ? context.object.organization.map((term) => term.uri) : [],
                event: context.object?.event ? context.object.event.map((term) => term.uri) : [],
              };

              return {
                data: { ...formObject },
                original: { ...formObject },
              };

            },
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
              target: ObjectStates.IDLE,
              actions: [
                assign((context, event) => ({
                  object: {
                    ...context.object,
                    [event.data.field]: event.data.selectedTerms?.length > 0
                      ? event.data.selectedTerms
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
