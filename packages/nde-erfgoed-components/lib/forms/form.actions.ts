import { assign, log } from 'xstate/lib/actions';
import { Event } from '../state/event';
import { FormEvents } from './form.events';
import { FormContext } from './form.machine';

/**
 * Actions for the form component.
 */

export const doSomething = log<FormContext<any>, Event<FormEvents>>('Machine doing something');
export const processUpdate = assign<FormContext<any>, Event<FormEvents>>({
  data: (context: FormContext<any>, event: Event<FormEvents>) => event.update(context.data),
});
