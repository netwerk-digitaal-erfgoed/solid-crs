import { Collection } from '@digita-ai/nde-erfgoed-core';
import { interpret, Interpreter, StateValueMap } from 'xstate';
import { Event } from '../state/event';
import { FormValidatorResult } from './form-validator-result';
import { FormEvents } from './form.events';
import { FormCleanlinessStates, FormContext, formMachine, FormRootStates, FormSubmissionStates, FormValidationStates } from './form.machine';

describe('FormMachine', () => {
  let machine: Interpreter<FormContext<Collection>>;

  beforeEach(() => {
    machine = interpret<FormContext<Collection>>(
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
    [ [ ], FormCleanlinessStates.PRISTINE, FormSubmissionStates.NOT_SUBMITTED, FormValidationStates.NOT_VALIDATED, [], { uri: '', name: 'Test' } ],
    [ [ {field: 'uri', value: 'foo'} ], FormCleanlinessStates.DIRTY, FormSubmissionStates.NOT_SUBMITTED, FormValidationStates.VALID, [], { uri: 'foo', name: 'Test' } ],
    [ [ {field: 'uri', value: ''} ], FormCleanlinessStates.PRISTINE, FormSubmissionStates.NOT_SUBMITTED, FormValidationStates.INVALID, [ { field: 'uri', message: 'demo-form.uri.required' } ], { uri: '', name: 'Test' } ],
    [ [ {field: 'name', value: ''} ], FormCleanlinessStates.DIRTY, FormSubmissionStates.NOT_SUBMITTED, FormValidationStates.INVALID, [ { field: 'name', message: 'demo-form.name.required' }, { field: 'uri', message: 'demo-form.uri.required' } ], { uri: '', name: '' } ],
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
    const stateValueMap = machine.state.value as StateValueMap;
    expect(stateValueMap[FormRootStates.CLEANLINESS]).toBe(cleanliness);
    expect(stateValueMap[FormRootStates.SUBMISSION]).toBe(submission);
    expect(stateValueMap[FormRootStates.VALIDATION]).toBe(validation);
  });

  // it('should should submit when form is valid', () => {
  //   machine.start();

  //   machine.send(FormEvents.FORM_UPDATED, {field: 'uri', value: 'foo'});
  //   machine.send(FormEvents.FORM_SUBMITTED);

  //   const stateValueMap = machine.state.value as StateValueMap;
  //   expect(stateValueMap[FormRootStates.CLEANLINESS]).toBe(FormCleanlinessStates.DIRTY);
  //   expect(stateValueMap[FormRootStates.SUBMISSION]).toBe(FormSubmissionStates.SUBMITTED);
  //   expect(stateValueMap[FormRootStates.VALIDATION]).toBe(FormValidationStates.VALID);
  // });

  it('should not change original data when form is updated', () => {
    machine.start();

    machine.send(FormEvents.FORM_UPDATED, {field: 'uri', value: 'foo'});

    expect(machine.state.context.original).toEqual({ uri: '', name: 'Test' });
  });

  it('should not be submitted if form is invalid', () => {
    machine.start();

    machine.send(FormEvents.FORM_SUBMITTED);

    const stateValueMap = machine.state.value as StateValueMap;
    expect(stateValueMap[FormRootStates.CLEANLINESS]).toBe(FormCleanlinessStates.PRISTINE);
    expect(stateValueMap[FormRootStates.SUBMISSION]).toBe(FormSubmissionStates.NOT_SUBMITTED);
    expect(stateValueMap[FormRootStates.VALIDATION]).toBe(FormValidationStates.INVALID);
  });

  // it('should allow re-submitting forms', () => {
  //   machine.start();

  //   machine.send(FormEvents.FORM_UPDATED, {field: 'uri', value: 'foo'});
  //   machine.send(FormEvents.FORM_SUBMITTED);
  //   machine.send(FormEvents.FORM_UPDATED, {field: 'name', value: ''});
  //   machine.send(FormEvents.FORM_SUBMITTED);

  //   const stateValueMap = machine.state.value as StateValueMap;
  //   expect(stateValueMap[FormRootStates.CLEANLINESS]).toBe(FormCleanlinessStates.DIRTY);
  //   expect(stateValueMap[FormRootStates.SUBMISSION]).toBe(FormSubmissionStates.NOT_SUBMITTED);
  //   expect(stateValueMap[FormRootStates.VALIDATION]).toBe(FormValidationStates.INVALID);
  // });
});
