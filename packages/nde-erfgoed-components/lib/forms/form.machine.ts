import { assign, createMachine } from 'xstate';
import { State } from '../state/state';
import { Event } from '../state/event';
import { Config } from '../state/config';
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
export interface FormUpdatedEvent extends Event<FormEvents> { type: FormEvents.FORM_UPDATED; update: (data: any) => any }
export interface FormSubmittedEvent extends Event<FormEvents> { type: FormEvents.FORM_SUBMITTED }

/**
 * Actions for the form component.
 */

/**
 * Updates the data in context.
 */
export const update = assign<FormContext<any>, Event<FormEvents>>({
  data: (context: FormContext<any>, event: Event<FormEvents>) => event.update(context.data),
});

/**
 * Validates the data in context.
 */
export const validate = assign<FormContext<any>, Event<FormEvents>>({
  validation: (context: FormContext<any>, event: Event<FormEvents>) => [ ...context?.data?.name ? [] : [ {message: 'test', field: 'name'} ] ],
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

/**
 * The machine config for the form component machine.
 */
const formConfig: Config<FormContext<any>, FormStates, FormEvents> = {
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
          exit: [ update, validate ],
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
          exit: [ update, validate ],
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
          exit: [ validate ],
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
          exit: [ update, validate ],
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
          exit: [ update, validate ],
        },
        [FormStates.INVALID]: {
          on: {
            [FormEvents.FORM_UPDATED]: {
              target: FormStates.CHECKING_VALIDATION,
            },
          },
          exit: [ update, validate ],
        },
      },
    },
  },
};

/**
 * The form component machine.
 */
export const formMachine = createMachine<FormContext<any>, Event<FormEvents>, State<FormStates, FormContext<any>>>(formConfig);
