import { createMachine } from 'xstate';
import { State } from '../state/state';
import { Event } from '../state/event';
import { FormValidatorResult } from './form-validator-result';
import { FormValidator } from './form-validator';
import { FormEvents, update, validate } from './form.events';

/**
 * The context of a form.
 */
export interface FormContext<TData> {
  data?: TData;
  original?: TData;
  validation?: FormValidatorResult[];
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
 * The form component machine.
 */
export const formMachine = (validator: FormValidator) => createMachine<FormContext<any>, Event<FormEvents>, State<FormStates, FormContext<any>>>({
  id: 'form',
  type: 'parallel',
  states: {
    /**
     * State which determines if form has changed.
     */
    [FormStates.CLEANLINESS]: {
      initial: FormStates.PRISTINE,
      states: {
        /**
         * The form has not changed.
         */
        [FormStates.PRISTINE]: {
          on: {
            [FormEvents.FORM_UPDATED]: {
              target: FormStates.CHECKING_CLEANLINESS,
            },
          },
          exit: [ update, validate(validator) ],
        },
        /**
         * Transient state while checking if form was changed.
         */
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
        /**
         * The form has been changed.
         */
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

    /**
     * State which determines if the form was submitted.
     */
    [FormStates.SUBMISSION]: {
      initial: FormStates.NOT_SUBMITTED,
      states: {
        /**
         * The form has not been submitted.
         */
        [FormStates.NOT_SUBMITTED]: {
          on: {
            [FormEvents.FORM_SUBMITTED]: {
              target: FormStates.SUBMITTING,
            },
          },
          exit: [ validate(validator) ],
        },
        /**
         * Transient state while submitting form.
         */
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
        /**
         * The form has been submitted.
         */
        [FormStates.SUBMITTED]: {
          on: {
            [FormEvents.FORM_SUBMITTED]: {
              target: FormStates.SUBMITTING,
            },
          },
          exit: [ validate(validator) ],
        },
      },
    },

    /**
     * State which determines if the form is validated.
     */
    [FormStates.VALIDATION]: {
      initial: FormStates.NOT_VALIDATED,
      states: {
        /**
         * The form has not yet been validated.
         */
        [FormStates.NOT_VALIDATED]: {
          on: {
            [FormEvents.FORM_UPDATED]: {
              target: FormStates.CHECKING_VALIDATION,
            },
            [FormEvents.FORM_SUBMITTED]: {
              target: FormStates.CHECKING_VALIDATION,
            },
          },
          exit: [ update, validate(validator) ],
        },
        /**
         * Transient state while checking validation.
         */
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
        /**
         * The form is valid, based on the provided validator function.
         */
        [FormStates.VALID]: {
          on: {
            [FormEvents.FORM_UPDATED]: {
              target: FormStates.CHECKING_VALIDATION,
            },
          },
          exit: [ update, validate(validator) ],
        },
        /**
         * The form is invalid, based on the provided validator function.
         */
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
