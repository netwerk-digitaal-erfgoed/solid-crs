import { Observable } from 'rxjs';
import { Event } from '../state/event';
import { FormValidatorResult } from './form-validator-result';
import { FormEvents } from './form.events';
import { FormContext } from './form.machine';

/**
 * Validates the form and returns validator results.
 */
export type FormValidator<TData> = (context: FormContext<TData>, event: Event<FormEvents>) => Observable<FormValidatorResult[]>;
