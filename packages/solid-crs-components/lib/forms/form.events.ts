import { assign, EventObject } from 'xstate';
import { FormValidatorResult } from './form-validator-result';
import { FormContext } from './form.machine';

/**
 * Event references for the form machine, with readable log format.
 */
export enum FormEvents {
  FORM_UPDATED = '[FormEvent: Updated element]',
  FORM_SUBMITTED = '[FormEvent: Submitted]',
  FORM_VALIDATED = '[FormEvent: Validated]',
}

/**
 * Event interfaces for the form machine, with their payloads.
 */

/**
 * Event dispatched when a form element was updated.
 */
export class FormUpdatedEvent implements EventObject {

  public type: FormEvents.FORM_UPDATED = FormEvents.FORM_UPDATED;
  constructor(public field: string, public value: string|string[]) { }

}

/**
 * Event dispatched when a form was submitted.
 */
export class FormSubmittedEvent implements EventObject {

  public type: FormEvents.FORM_SUBMITTED = FormEvents.FORM_SUBMITTED;

}

/**
 * Event dispatched when a form was validated.
 */
export class FormValidatedEvent implements EventObject {

  public type: FormEvents.FORM_VALIDATED = FormEvents.FORM_VALIDATED;
  constructor(public results: FormValidatorResult[]) { }

}

/**
 * Union type for all form events.
 */
export type FormEvent = FormUpdatedEvent | FormSubmittedEvent | FormValidatedEvent;

/**
 * Actions for the form component.
 */

/**
 * Updates the data in context.
 */
export const update = assign<FormContext<unknown>, FormUpdatedEvent>({
  data: (context: FormContext<any>, event: FormUpdatedEvent) =>
    ({ ...context.data||{}, [event.field]: event.value }),
});

/**
 * Adds validation data to context.
 */
export const addValidationResults = assign<FormContext<unknown>, FormValidatedEvent>({
  validation: (context, event: FormValidatedEvent) => [ ...event.results ],
});
