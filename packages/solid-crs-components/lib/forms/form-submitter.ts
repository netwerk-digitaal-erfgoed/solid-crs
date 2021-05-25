import { FormEvent } from './form.events';
import { FormContext } from './form.machine';

/**
 * Validates the form and returns validator results.
 */
export type FormSubmitter<TData> = (context: FormContext<TData>, event: FormEvent) => Promise<TData>;
