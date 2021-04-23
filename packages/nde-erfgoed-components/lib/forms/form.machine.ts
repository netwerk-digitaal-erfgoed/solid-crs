import { createMachine } from 'xstate';
import { State } from '../state/state';
import { Event } from '../state/event';
import { Config } from '../state/config';
import { FormEvents } from './form.events';
import { doSomething, processUpdate } from './form.actions';

/**
 * The context of a collections feature.
 */
export interface FormContext<TData> {
  data?: TData;
}

/**
 * State references for the form component, with readable log format.
 */
export enum FormStates {
  CHANGES   = '[FormState: Changes]',
  PRISTINE   = '[FormState: Pristine]',
  DIRTY      = '[FormState: Dirty]',

  SUBMISSION = '[FormState: Submission]',
  NOT_SUBMITTED = '[FormState: Not submitted]',
  SUBMITTING = '[FormState: Submitting]',
  SUBMITTED  = '[FormState: Submitted]',

  ENABLEMENT   = '[FormState: Enablement]',
  ENABLED   = '[FormState: Enabled]',
  DISABLED   = '[FormState: Disabled]',

  VALIDATION = '[FormState: Validation]',
  NOT_VALIDATED = '[FormState: Not validated]',
  VALIDATING = '[FormState: Validating]',
  VALID      = '[FormState: Valid]',
  INVALID    = '[FormState: Invalid]',
}

/**
 * The machine config for the form component machine.
 */
const formConfig: Config<FormContext<any>, FormStates, FormEvents> = {
  id: 'form',
  type: 'parallel',
  on: {
    [FormEvents.SELECTED_ELEMENT]: {
      actions: [ doSomething ],
    },
    [FormEvents.UPDATED_ELEMENT]: {
      actions: [ doSomething, processUpdate ],
    },
  },
  states: {
    [FormStates.CHANGES]: {
      initial: FormStates.PRISTINE,
      states: {
        [FormStates.PRISTINE]: { },
        [FormStates.DIRTY]: { },
      },
    },
    [FormStates.SUBMISSION]: {
      initial: FormStates.NOT_SUBMITTED,
      states: {
        [FormStates.NOT_SUBMITTED]: { },
        [FormStates.SUBMITTING]: { },
        [FormStates.SUBMITTED]: { },
      },
    },
    [FormStates.ENABLEMENT]: {
      initial: FormStates.ENABLED,
      states: {
        [FormStates.ENABLED]: { },
        [FormStates.DISABLED]: { },
      },
    },
    [FormStates.VALIDATION]: {
      initial: FormStates.NOT_VALIDATED,
      states: {
        [FormStates.NOT_VALIDATED]: { },
        [FormStates.VALIDATING]: { },
        [FormStates.VALID]: { },
        [FormStates.INVALID]: { },
      },
    },
  },
};

/**
 * The form component machine.
 */
export const formMachine = createMachine<FormContext<any>, Event<FormEvents>, State<FormStates, FormContext<any>>>(formConfig);
