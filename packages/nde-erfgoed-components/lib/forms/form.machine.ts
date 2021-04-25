import { createMachine } from 'xstate';
import { State } from '../state/state';
import { Event } from '../state/event';
import { Config } from '../state/config';
import { FormEvents } from './form.events';
import { update, validate } from './form.actions';
import { FormValidationResult } from './form-validation-result';

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
            [FormEvents.UPDATED_ELEMENT]: {
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
            [FormEvents.UPDATED_ELEMENT]: {
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
            [FormEvents.SUBMITTED]: {
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
            [FormEvents.UPDATED_ELEMENT]: {
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
            [FormEvents.UPDATED_ELEMENT]: {
              target: FormStates.CHECKING_VALIDATION,
            },
          },
          exit: [ update, validate ],
        },
        [FormStates.INVALID]: {
          on: {
            [FormEvents.UPDATED_ELEMENT]: {
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
