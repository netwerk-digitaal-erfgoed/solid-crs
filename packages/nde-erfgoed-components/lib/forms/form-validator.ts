import { Event } from '../state/event';
import { FormValidatorResult } from './form-validator-result';
import { FormEvents } from './form.events';
import { FormContext } from './form.machine';

/**
 * Validates the form and returns validator results.
 */
export type FormValidator = (context: FormContext<any>, event: Event<FormEvents>) => FormValidatorResult[];
