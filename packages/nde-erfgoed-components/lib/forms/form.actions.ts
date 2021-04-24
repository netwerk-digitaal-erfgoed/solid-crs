import { assign, log } from 'xstate/lib/actions';
import { Event } from '../state/event';
import { FormEvents } from './form.events';
import { FormContext } from './form.machine';

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
  validation: (context: FormContext<any>, event: Event<FormEvents>) => [ ...context?.data?.name ? [] : [ {message: 'test'} ] ],
});
