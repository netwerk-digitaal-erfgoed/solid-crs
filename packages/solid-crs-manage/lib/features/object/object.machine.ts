import { FormValidatorResult, FormContext, State } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { assign, createMachine, send, sendParent } from 'xstate';
import { activeRoute, Collection, CollectionObject, CollectionObjectSolidStore, CollectionObjectStore, TermService, SolidSDKService } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import edtf from 'edtf';

import { routes } from '../../app.machine';
import { ClickedTermFieldEvent, ObjectEvent, ObjectEvents, SelectedTermsEvent } from './object.events';
import { TermActors, termMachine } from './terms/term.machine';
import { ObjectUpdate } from './models/object-update.model';
import { importUpdates, loadNotifications } from './object.services';

/**
 * The context of the object feature.
 */
export interface ObjectContext {
  /**
   * The currently selected object with potential edits.
   */
  object?: CollectionObject;
  /**
   * The original CollectionObject, equals the object in the pod.
   * Used for form validation
   */
  original?: CollectionObject;
  /**
   * A list of all collections.
   */
  collections?: Collection[];
  /**
   * A list of all collections.
   */
  termService?: TermService;
  /**
   * The WebID of the heritage institution
   */
  webId?: string;
  /**
   * A list of updates to an object. Derived from the notifications in the inbox.
   */
  notifications?: ObjectUpdate[];
  /**
   * Service to interact with Solid pods
   */
  solidService: SolidSDKService;
  /**
   * Service to retrieve object from pod
   */
  objectStore: CollectionObjectSolidStore;
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
  LOADING_OBJECT  = '[ObjectsState: Loading Object]',
  LOADING_OBJECT_INBOX = '[ObjectState: Loading Object Inbox]',
  OBJECT_UPDATES_OVERVIEW = '[ObjectState: Object Updates Overview]',
  IMPORTING_UPDATES = '[ObjectState: Importing Updates]',
}

/**
 * Validate the values of a collection object
 *
 * @param context the context of the object to be validated
 * @returns a list of validator results
 */
export const validateObjectForm = async (context: FormContext<CollectionObject>): Promise<FormValidatorResult[]> => {

  const res: FormValidatorResult[]  = [];

  for (const field of Object.keys(context.data)) {

    const value = context.data[field as keyof CollectionObject];

    // the description of an object can not be longer than 10.000 characters
    if (field === 'description' && value && (value as typeof context.data[typeof field]).length > 10000) {

      res.push({
        field,
        message: 'object.card.identification.field.description.validation.max-characters',
      });

    } else if (field === 'name' && !value) {

      // the name/title of an object can not be empty

      res.push({
        field,
        message: 'object.card.common.empty',
      });

    } else if (field === 'name' && value && (value as typeof context.data[typeof field]).length > 100) {

      // the name/title of an object can not be longer than 100 characters

      res.push({
        field,
        message: 'object.card.identification.field.name.validation.max-characters',
      });

    } else if (field === 'identifier' && !value) {

      // the identifier of an object can not be empty

      res.push({
        field,
        message: 'object.card.common.empty',
      });

    } else if (field === 'type') {

      // the type of an object can not be empty
      if (!value) {

        res.push({
          field,
          message: 'object.card.common.empty',
        });

      } else {

        // the type must be a valid URL
        try {

          new URL(value as typeof context.data[typeof field]);

        } catch {

          res.push({
            field,
            message: 'object.card.common.invalid-url',
          });

        }

      }

    } else if (field === 'additionalType') {

      // the additionalType of an object can not be empty

      if (!value || (value as typeof context.data[typeof field])?.length < 1) {

        res.push({
          field,
          message: 'object.card.common.empty',
        });

      }

    } else if (field === 'image' && !value) {

      // the identifier of an object can not be empty

      res.push({
        field,
        message: 'object.card.common.empty',
      });

    } else if (field === 'image' && value) {

      // the image url should be valid and return png/jpeg mime type

      try {

        new URL((value as typeof context.data[typeof field]));

      } catch (error) {

        res.push({
          field,
          message: 'object.card.common.invalid-url',
        });

      }

    } else if (field === 'dateCreated' && (value as typeof context.data[typeof field])?.length > 0) {

      // the date should be valid EDTF

      try {

        edtf.parse(value);

      } catch (error) {

        res.push({
          field,
          message: 'object.card.creation.field.date.validation.invalid',
        });

      }

    } else if ([ 'depth', 'width', 'height', 'weight' ].includes(field)) {

      // validate numbers
      if (value && isNaN(+value)) {

        res.push({
          field,
          message: 'object.card.common.invalid-number',
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
    initial: ObjectStates.LOADING_OBJECT,
    on: {
      [ObjectEvents.SELECTED_OBJECT]: {
        actions: assign({
          object: (c, event) => event.object,
          original: (c, event) => event.object,
        }),
        target: ObjectStates.LOADING_OBJECT,
      },
    },
    states: {
      [ObjectStates.LOADING_OBJECT]: {
        invoke: {
          src: async (context): Promise<CollectionObject> => {

            if (context.object) {

              return context.object;

            } else {

              return await objectStore.get(decodeURIComponent(activeRoute(routes).pathParams.get('objectUri')));

            }

          },
          onDone: {
            target: ObjectStates.LOADING_OBJECT_INBOX,
            actions: assign({
              object: (c, event) => event.data,
              original: (c, event) => event.data,
            }),
          },
          onError: {
            target: ObjectStates.LOADING_OBJECT_INBOX,
            actions: sendParent((c, event) => event),
          },
        },
      },
      [ObjectStates.LOADING_OBJECT_INBOX]: {
        invoke: {
          src: (c, e) => loadNotifications(c, e),
          onDone: {
            actions: assign({
              notifications: (c, event) => event.data,
            }),
            target: ObjectStates.IDLE,
          },
          onError: {
            actions: sendParent((c, event) => event),
            target: ObjectStates.IDLE,
          },
        },
      },
      [ObjectStates.SAVING]: {
        invoke: {
          src: (context) => objectStore.save(context.object),
          onDone: {
            target: ObjectStates.IDLE,
            // overwrite original with new, edited object
            actions: assign((context) => ({ original: context.object })),
          },
          onError: {
            target: ObjectStates.IDLE,
            actions: sendParent((context, event) => event),
          },
        },
      },
      [ObjectStates.IDLE]: {
        on: {
          [ObjectEvents.CLICKED_SAVE]: {
            target: ObjectStates.SAVING,
            actions: assign({ object: (context, event) => event.object }),
          },
          [ObjectEvents.CLICKED_OBJECT_UPDATES_OVERVIEW]: ObjectStates.OBJECT_UPDATES_OVERVIEW,
          [ObjectEvents.CLICKED_DELETE]: ObjectStates.DELETING,
          [ObjectEvents.CLICKED_RESET]: {
            target: ObjectStates.IDLE,
            actions: assign((context) => ({ object: context.original })),
          },
          [ObjectEvents.CLICKED_TERM_FIELD]: ObjectStates.EDITING_FIELD,
        },
      },
      [ObjectStates.OBJECT_UPDATES_OVERVIEW]: {
        on: {
          [ObjectEvents.CLICKED_SIDEBAR_ITEM]: ObjectStates.IDLE,
          [ObjectEvents.CLICKED_IMPORT_UPDATES]: ObjectStates.IMPORTING_UPDATES,
        },
      },
      [ObjectStates.IMPORTING_UPDATES]: {
        invoke: {
          src: (c, e) => importUpdates(c, e),
          onDone: {
            target: ObjectStates.SAVING,
            actions: assign({ object: (c, event) => event.data }),
          },
          onError: {
            target: ObjectStates.IDLE,
            actions: sendParent((c, event) => event),
          },
        },
      },
      [ObjectStates.EDITING_FIELD]: {
        on: {
          [ObjectEvents.CLICKED_DELETE]: ObjectStates.DELETING,
          [ObjectEvents.CLICKED_SIDEBAR_ITEM]: ObjectStates.IDLE,
          [ObjectEvents.CLICKED_CANCEL_TERM]: ObjectStates.IDLE,
        },
        invoke: [
          {
            id: TermActors.TERM_MACHINE,
            src: termMachine,
            data: (context, event: ClickedTermFieldEvent) => ({
              field: event.field,
              selectedTerms: event.terms,
              termService: context.termService || new TermService(process.env.VITE_TERM_ENDPOINT),
            }),
            onDone: {
              target: ObjectStates.IDLE,
              actions: [
                send((context, event) => new SelectedTermsEvent(event.data.field, event.data.selectedTerms)),
                assign((context, event) => ({
                  object: {
                    ...context.object,
                    [event.data.field]: event.data.selectedTerms,
                  },
                })),
              ],
            },
            onError: {
              target: ObjectStates.IDLE,
              actions: sendParent((context, event) => event),
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
            target: ObjectStates.IDLE,
            actions: sendParent((context, event) => event),
          },
        },
      },
    },
  });
