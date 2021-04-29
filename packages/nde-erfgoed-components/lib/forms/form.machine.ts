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
 * State references of the root parallel states of the form machine.
 */
export enum FormRootStates {
  CLEANLINESS   = '[FormState: Cleanliness]',
  SUBMISSION = '[FormState: Submission]',
  VALIDATION = '[FormState: Validation]',
}

/**
 * State references of the submission sub-state.
 */
export enum FormSubmissionStates {
  NOT_SUBMITTED = '[FormState: Not submitted]',
  SUBMITTING = '[FormState: Submitting]',
  SUBMITTED  = '[FormState: Submitted]',
}

/**
 * State references of the cleanliness sub-state.
 */
export enum FormCleanlinessStates {
  PRISTINE   = '[FormState: Pristine]',
  CHECKING_CLEANLINESS = '[FormState: Checking cleanliness]',
  DIRTY      = '[FormState: Dirty]',
}

/**
 * State references of the validation sub-state.
 */
export enum FormValidationStates {
  NOT_VALIDATED = '[FormState: Not validated]',
  CHECKING_VALIDATION = '[FormState: Checking validation]',
  VALID      = '[FormState: Valid]',
  INVALID    = '[FormState: Invalid]',
}

/**
 * Union type of all valid states used in the form machine.
 */
export type FormStates = FormRootStates | FormSubmissionStates | FormCleanlinessStates | FormValidationStates;

/**
 * The form component machine.
 */
export const formMachine = <T>(validator: FormValidator<T>) => createMachine<FormContext<T>, Event<FormEvents>, State<FormStates, FormContext<T>>>({
  id: 'form',
  type: 'parallel',
  states: {
    /**
     * State which determines if form has changed.
     */
    [FormRootStates.CLEANLINESS]: {
      initial: FormCleanlinessStates.PRISTINE,
      states: {
        /**
         * The form has not changed.
         */
        [FormCleanlinessStates.PRISTINE]: {
          on: {
            [FormEvents.FORM_UPDATED]: {
              target: FormCleanlinessStates.CHECKING_CLEANLINESS,
            },
          },
          exit: [ update, validate(validator) ],
        },
        /**
         * Transient state while checking if form was changed.
         */
        [FormCleanlinessStates.CHECKING_CLEANLINESS]: {
          always: [
            {
              target: FormCleanlinessStates.PRISTINE,
              cond: (context: FormContext<T>) => JSON.stringify(context.data) === JSON.stringify(context.original),
            },
            {
              target: FormCleanlinessStates.DIRTY,
            },
          ],
        },
        /**
         * The form has been changed.
         */
        [FormCleanlinessStates.DIRTY]: {
          on: {
            [FormEvents.FORM_UPDATED]: {
              target: FormCleanlinessStates.CHECKING_CLEANLINESS,
            },
          },
          exit: [ update, validate(validator) ],
        },
      },
    },

    /**
     * State which determines if the form was submitted.
     */
    [FormRootStates.SUBMISSION]: {
      initial: FormSubmissionStates.NOT_SUBMITTED,
      states: {
        /**
         * The form has not been submitted.
         */
        [FormSubmissionStates.NOT_SUBMITTED]: {
          on: {
            [FormEvents.FORM_SUBMITTED]: {
              target: FormSubmissionStates.SUBMITTING,
            },
          },
          exit: [ validate(validator) ],
        },
        /**
         * Transient state while submitting form.
         */
        [FormSubmissionStates.SUBMITTING]: {
          always: [
            {
              target: FormSubmissionStates.SUBMITTED,
              cond: (context: FormContext<T>) => context.validation === null || context.validation.length === 0,
            },
            {
              target: FormSubmissionStates.NOT_SUBMITTED,
            },
          ],
        },
        /**
         * The form has been submitted.
         */
        [FormSubmissionStates.SUBMITTED]: {
          on: {
            [FormEvents.FORM_SUBMITTED]: {
              target: FormSubmissionStates.SUBMITTING,
            },
          },
          exit: [ validate(validator) ],
        },
      },
    },

    /**
     * State which determines if the form is validated.
     */
    [FormRootStates.VALIDATION]: {
      initial: FormValidationStates.NOT_VALIDATED,
      states: {
        /**
         * The form has not yet been validated.
         */
        [FormValidationStates.NOT_VALIDATED]: {
          on: {
            [FormEvents.FORM_UPDATED]: {
              target: FormValidationStates.CHECKING_VALIDATION,
            },
            [FormEvents.FORM_SUBMITTED]: {
              target: FormValidationStates.CHECKING_VALIDATION,
            },
          },
          exit: [ update, validate(validator) ],
        },
        /**
         * Transient state while checking validation.
         */
        [FormValidationStates.CHECKING_VALIDATION]: {
          always: [
            {
              target: FormValidationStates.VALID,
              cond: (context: FormContext<T>) => context.validation === null || context.validation.length === 0,
            },
            {
              target: FormValidationStates.INVALID,
            },
          ],
        },
        /**
         * The form is valid, based on the provided validator function.
         */
        [FormValidationStates.VALID]: {
          on: {
            [FormEvents.FORM_UPDATED]: {
              target: FormValidationStates.CHECKING_VALIDATION,
            },
          },
          exit: [ update, validate(validator) ],
        },
        /**
         * The form is invalid, based on the provided validator function.
         */
        [FormValidationStates.INVALID]: {
          on: {
            [FormEvents.FORM_UPDATED]: {
              target: FormValidationStates.CHECKING_VALIDATION,
            },
          },
          exit: [ update, validate(validator) ],
        },
      },
    },
  },
});
