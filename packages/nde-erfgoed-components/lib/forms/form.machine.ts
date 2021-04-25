import { assign, createMachine } from 'xstate';
import { State } from '../state/state';
import { Event } from '../state/event';
import { FormValidationResult } from './form-validation-result';

/**
 * Event references for the collection component, with readable log format.
 */
export enum FormEvents {
  FORM_UPDATED = '[FormEvent: Updated element]',
  FORM_SUBMITTED = '[FormEvent: Subitted]',
}

/**
 * Event interfaces for the collection component, with their payloads.
 */
export interface FormUpdatedEvent extends Event<FormEvents> { type: FormEvents.FORM_UPDATED; field: string; value: string }
export interface FormSubmittedEvent extends Event<FormEvents> { type: FormEvents.FORM_SUBMITTED }

/**
 * Actions for the form component.
 */

/**
 * Updates the data in context.
 */
export const update = assign<FormContext<any>, FormUpdatedEvent>({
  data: (context: FormContext<any>, event: FormUpdatedEvent) => ({...context.data ? context.data : {}, [event.field]: event.value}),
});

/**
 * Validates the data in context.
 */
export const validate = (validator: FormValidator) => assign<FormContext<any>, Event<FormEvents>>({
  validation: (context: FormContext<any>, event: Event<FormEvents>) => [ ...validator(context, event) ],
});

/**
 * The context of a collections feature.
 */
export interface FormContext<TData> {
  data?: TData;
  original?: TData;
  validation?: FormValidationResult[];
}

/**
 * State references for the form component, with readable log format.
 */
export enum FormStates {
  CLEANLINESS   = '[FormState: Cleanliness]',
  PRISTINE   = '[FormState: Pristine]',
  CHECKING_CLEANLINESS = '[FormState: Checking cleanliness]',
  DIRTY      = '[FormState: Dirty]',

  SUBMISSION = '[FormState: Submission]',
  NOT_SUBMITTED = '[FormState: Not submitted]',
  SUBMITTING = '[FormState: Submitting]',
  SUBMITTED  = '[FormState: Submitted]',

  VALIDATION = '[FormState: Validation]',
  NOT_VALIDATED = '[FormState: Not validated]',
  CHECKING_VALIDATION = '[FormState: Checking validation]',
  VALID      = '[FormState: Valid]',
  INVALID    = '[FormState: Invalid]',
}

export type FormValidator = (context: FormContext<any>, event: Event<FormEvents>) => FormValidationResult[];

/**
 * The form component machine.
 */
export const formMachine = (validator: FormValidator) => createMachine<FormContext<any>, Event<FormEvents>, State<FormStates, FormContext<any>>>({
  id: 'form',
  type: 'parallel',
  states: {
    [FormStates.CLEANLINESS]: {
      initial: FormStates.PRISTINE,
      states: {
        [FormStates.PRISTINE]: {
          on: {
            [FormEvents.FORM_UPDATED]: {
              target: FormStates.CHECKING_CLEANLINESS,
            },
          },
          exit: [ update, validate(validator) ],
        },
        [FormStates.CHECKING_CLEANLINESS]: {
          always: [
            {
              target: FormStates.PRISTINE,
              cond: (context, event) => JSON.stringify(context.data) === JSON.stringify(context.original),
            },
            {
              target: FormStates.DIRTY,
            },
          ],
        },
        [FormStates.DIRTY]: {
          on: {
            [FormEvents.FORM_UPDATED]: {
              target: FormStates.CHECKING_CLEANLINESS,
            },
          },
          exit: [ update, validate(validator) ],
        },
      },
    },
    [FormStates.SUBMISSION]: {
      initial: FormStates.NOT_SUBMITTED,
      states: {
        [FormStates.NOT_SUBMITTED]: {
          on: {
            [FormEvents.FORM_SUBMITTED]: {
              target: FormStates.SUBMITTING,
            },
          },
          exit: [ validate(validator) ],
        },
        [FormStates.SUBMITTING]: {
          always: [
            {
              target: FormStates.SUBMITTED,
              cond: (context, event) => context.validation === null || context.validation.length === 0,
            },
            {
              target: FormStates.NOT_SUBMITTED,
            },
          ],
        },
        [FormStates.SUBMITTED]: { },
      },
    },
    [FormStates.VALIDATION]: {
      initial: FormStates.NOT_VALIDATED,
      states: {
        [FormStates.NOT_VALIDATED]: {
          on: {
            [FormEvents.FORM_UPDATED]: {
              target: FormStates.CHECKING_VALIDATION,
            },
          },
          exit: [ update, validate(validator) ],
        },
        [FormStates.CHECKING_VALIDATION]: {
          always: [
            {
              target: FormStates.VALID,
              cond: (context, event) => context.validation === null || context.validation.length === 0,
            },
            {
              target: FormStates.INVALID,
            },
          ],
        },
        [FormStates.VALID]: {
          on: {
            [FormEvents.FORM_UPDATED]: {
              target: FormStates.CHECKING_VALIDATION,
            },
          },
          exit: [ update, validate(validator) ],
        },
        [FormStates.INVALID]: {
          on: {
            [FormEvents.FORM_UPDATED]: {
              target: FormStates.CHECKING_VALIDATION,
            },
          },
          exit: [ update, validate(validator) ],
        },
      },
    },
  },
});
