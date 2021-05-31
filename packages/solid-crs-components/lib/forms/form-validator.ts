import { FormValidatorResult } from './form-validator-result';
import { FormEvent } from './form.events';
import { FormContext } from './form.machine';

/**
 * Validates the form and returns validator results.
 */
export type FormValidator<TData> = (context: FormContext<TData>, event: FormEvent) => Promise<FormValidatorResult[]>;
