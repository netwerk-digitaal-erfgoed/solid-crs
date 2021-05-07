import { createMachine } from 'xstate';
import { map } from 'rxjs/operators';
import { State } from '../state/state';
import { FormValidatorResult } from './form-validator-result';
import { FormValidator } from './form-validator';
import { addValidationResults, FormEvent, FormEvents, FormValidatedEvent, update } from './form.events';
import { FormSubmitter } from './form-submitter';

/**
 * The context of a form.
 */
export interface FormContext<TData> {
  data?: TData;
  original?: TData;
  validation?: FormValidatorResult[];
}

/**
 * Actor references for this machine config.
 */
export enum FormActors {
  FORM_MACHINE = 'FormMachine',
}

/**
 * State references of the root parallel states of the form machine.
 */
export enum FormRootStates {
  CLEANLINESS   = '[FormState: Cleanliness]',
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
  VALIDATING = '[FormState: Validating]',
  VALID      = '[FormState: Valid]',
  INVALID    = '[FormState: Invalid]',
}

/**
 * Union type of all valid states used in the form machine.
 */
export type FormStates = FormRootStates | FormSubmissionStates | FormCleanlinessStates | FormValidationStates;

/**
 * Function which generates a form machine.
 *
 * @param validator A function which validates the form.
 * @param submitter A function which submits the form.
 * @returns A form machine.
 */
export const formMachine = <T>(
  validator: FormValidator<T>,
  submitter: FormSubmitter<T> = async (context) => context.data
) => createMachine<FormContext<T>, FormEvent, State<FormStates, FormContext<T>>>(
  {
    id: FormActors.FORM_MACHINE,
    initial: FormSubmissionStates.NOT_SUBMITTED,
    states: {
      /**
       * The form has not been submitted.
       */
      [FormSubmissionStates.NOT_SUBMITTED]: {
        type: 'parallel',
        on: {
          [FormEvents.FORM_SUBMITTED]: {
            target: FormSubmissionStates.SUBMITTING,
          },
        },
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
              },
              /**
               * Transient state while checking if form was changed.
               */
              [FormCleanlinessStates.CHECKING_CLEANLINESS]: {
                entry: update,
                always: [
                  {
                    target: FormCleanlinessStates.PRISTINE,
                    cond: (context: FormContext<T>) =>
                      JSON.stringify(context.data) === JSON.stringify(context.original),
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
                    target: FormValidationStates.VALIDATING,
                  },
                  [FormEvents.FORM_SUBMITTED]: {
                    target: FormValidationStates.VALIDATING,
                  },
                },
              },
              /**
               * Transient state while validating.
               */
              [FormValidationStates.VALIDATING]: {
                entry: update,
                invoke: {
                  src: (context, event) => validator(context, event).pipe(
                    map((results) => ({ type: FormEvents.FORM_VALIDATED, results })),
                  ),
                },
                on: {
                  [FormEvents.FORM_VALIDATED]: [
                    {
                      cond: (_, event: FormValidatedEvent) => !event.results || event.results.length === 0,
                      actions: addValidationResults,
                      target: FormValidationStates.VALID,
                    },
                    {
                      cond: (_, event: FormValidatedEvent) => event.results && event.results.length > 0,
                      actions: addValidationResults,
                      target: FormValidationStates.INVALID,
                    },
                  ],
                },
              },
              /**
               * The form is valid, based on the provided validator function.
               */
              [FormValidationStates.VALID]: {
                on: {
                  [FormEvents.FORM_UPDATED]: {
                    target: FormValidationStates.VALIDATING,
                  },
                },
              },
              /**
               * The form is invalid, based on the provided validator function.
               */
              [FormValidationStates.INVALID]: {
                on: {
                  [FormEvents.FORM_UPDATED]: {
                    target: FormValidationStates.VALIDATING,
                  },
                },
              },
            },
          },
        },
      },
      /**
       * Transient state while submitting form. Invokes the machine's submitter.
       */
      [FormSubmissionStates.SUBMITTING]: {
        entry: update,
        invoke: {
          src: (context, event) => submitter(context, event),
          onDone: {
            target: FormSubmissionStates.SUBMITTED,
          },
          onError: {
            target: FormSubmissionStates.NOT_SUBMITTED,
          },
        },
      },
      /**
       * The form has been submitted.
       */
      [FormSubmissionStates.SUBMITTED]: {
        data: {
          data: (context: FormContext<T>) => context.data,
        },
        type: 'final',
      },
    },
  },
);
