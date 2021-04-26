import { Collection } from '@digita-ai/nde-erfgoed-core';
import { interpret, Interpreter } from 'xstate';
import { Event } from '../state/event';
import { Schema } from '../state/schema';
import { FormValidatorResult } from './form-validator-result';
import { FormEvents } from './form.events';
import { FormContext, formMachine, FormStates } from './form.machine';

describe('FormMachine', () => {
  let machine: Interpreter<FormContext<Collection>, Schema<FormContext<Collection>, FormEvents>, Event<FormEvents>>;

  beforeEach(() => {
    machine = interpret<FormContext<Collection>, any, Event<FormEvents>>(
      formMachine(
        (context: FormContext<Collection>, event: Event<FormEvents>): FormValidatorResult[] => [
          ...context.data && context.data.name ? [] : [ { field: 'name', message: 'demo-form.name.required' } ],
          ...context.data && context.data.uri ? [] : [ { field: 'uri', message: 'demo-form.uri.required' } ],
        ],
      )
        .withContext({
          data: { uri: '', name: 'Test' },
          original: { uri: '', name: 'Test' },
          validation: [],
        }),
    );
  });

  it('should be correctly instantiated', () => {
    expect(machine).toBeTruthy();
  });

  it.each([
    [ [ ], FormStates.PRISTINE, FormStates.NOT_SUBMITTED, FormStates.NOT_VALIDATED, [], { uri: '', name: 'Test' } ],
    [ [ {field: 'uri', value: 'foo'} ], FormStates.DIRTY, FormStates.NOT_SUBMITTED, FormStates.VALID, [], { uri: 'foo', name: 'Test' } ],
    [ [ {field: 'uri', value: ''} ], FormStates.PRISTINE, FormStates.NOT_SUBMITTED, FormStates.INVALID, [ { field: 'uri', message: 'demo-form.uri.required' } ], { uri: '', name: 'Test' } ],
    [ [ {field: 'name', value: ''} ], FormStates.DIRTY, FormStates.NOT_SUBMITTED, FormStates.INVALID, [ { field: 'name', message: 'demo-form.name.required' }, { field: 'uri', message: 'demo-form.uri.required' } ], { uri: '', name: '' } ],
  ])('should handle form updates correctly', (updates, cleanliness, submission, validation, results, data) => {
    machine.start();

    // Send updates
    for(const update of updates) {
      machine.send(FormEvents.FORM_UPDATED, update);
    }

    // Validation rules should be set correctly
    expect(machine.state.context.validation).toEqual(results);

    // Data should be updated
    expect(machine.state.context.data).toEqual(data);

    // States should be updated
    expect(machine.state.value[FormStates.CLEANLINESS]).toBe(cleanliness);
    expect(machine.state.value[FormStates.SUBMISSION]).toBe(submission);
    expect(machine.state.value[FormStates.VALIDATION]).toBe(validation);
  });

  it('should should submit when form is valid', () => {
    machine.start();
    machine.send(FormEvents.FORM_UPDATED, {field: 'uri', value: 'foo'});
    machine.send(FormEvents.FORM_SUBMITTED);

    expect(machine.state.value[FormStates.CLEANLINESS]).toBe(FormStates.DIRTY);
    expect(machine.state.value[FormStates.SUBMISSION]).toBe(FormStates.SUBMITTED);
    expect(machine.state.value[FormStates.VALIDATION]).toBe(FormStates.VALID);
  });

  it('should not change original data when form is updated', () => {
    machine.start();
    machine.send(FormEvents.FORM_UPDATED, {field: 'uri', value: 'foo'});

    expect(machine.state.context.original).toEqual({ uri: '', name: 'Test' });
  });

  it('should not be submitted if form is invalid', () => {
    machine.start();
    machine.send(FormEvents.FORM_SUBMITTED);

    expect(machine.state.value[FormStates.CLEANLINESS]).toBe(FormStates.PRISTINE);
    expect(machine.state.value[FormStates.SUBMISSION]).toBe(FormStates.NOT_SUBMITTED);
    expect(machine.state.value[FormStates.VALIDATION]).toBe(FormStates.INVALID);
  });

  it('should allow re-submitting forms', () => {
    machine.start();
    machine.send(FormEvents.FORM_UPDATED, {field: 'uri', value: 'foo'});
    machine.send(FormEvents.FORM_SUBMITTED);
    machine.send(FormEvents.FORM_UPDATED, {field: 'name', value: ''});
    machine.send(FormEvents.FORM_SUBMITTED);

    expect(machine.state.value[FormStates.CLEANLINESS]).toBe(FormStates.DIRTY);
    expect(machine.state.value[FormStates.SUBMISSION]).toBe(FormStates.NOT_SUBMITTED);
    expect(machine.state.value[FormStates.VALIDATION]).toBe(FormStates.INVALID);
  });
});
