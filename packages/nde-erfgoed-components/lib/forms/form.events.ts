import { assign } from 'xstate';
import { Event } from '../state/event';
import { FormValidator } from './form-validator';
import { FormContext } from './form.machine';

/**
 * Event references for the form machine, with readable log format.
 */
export enum FormEvents {
  FORM_UPDATED = '[FormEvent: Updated element]',
  FORM_SUBMITTED = '[FormEvent: Submitted]',
}

/**
 * Event interfaces for the form machine, with their payloads.
 */

/**
 * Event dispatched when a form element was updated.
 */
export interface FormUpdatedEvent extends Event<FormEvents> { type: FormEvents.FORM_UPDATED; field: string; value: string }

/**
 * Event dispatched when a form was submitted.
 */
export interface FormSubmittedEvent extends Event<FormEvents> { type: FormEvents.FORM_SUBMITTED }

/**
 * Actions for the form component.
 */

/**
 * Updates the data in context.
 */
export const update = assign<FormContext<unknown>, FormUpdatedEvent>({
  data: (context: FormContext<unknown>, event: FormUpdatedEvent) => (typeof context.data === 'object' ? {...context.data ? context.data : {}, [event.field]: event.value} : event.value),
});

/**
 * Validates the data in context.
 */
export const validate = (validator: FormValidator<unknown>) => assign<FormContext<unknown>, Event<FormEvents>>({
  validation: (context: FormContext<unknown>, event: Event<FormEvents>) => [ ...validator(context, event) ],
});
