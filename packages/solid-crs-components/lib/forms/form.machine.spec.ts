/* eslint-disable @typescript-eslint/no-explicit-any */
import { Collection } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { interpret, Interpreter } from 'xstate';
import { FormEvent, FormEvents } from './form.events';
import { FormCleanlinessStates, FormContext, formMachine, FormRootStates, FormSubmissionStates, FormValidationStates } from './form.machine';

describe('FormMachine', () => {

  let machine: Interpreter<FormContext<any>, any, FormEvent>;

  const mockCollection: Collection = {
    name: 'Collection 1',
    description: 'Description',
    objectsUri: 'https://objects.uri/',
    distribution: 'https://distribution.uri/',
    uri: 'https://collection.uri/',
  };

  beforeEach(() => {

    machine = interpret<FormContext<Collection>, any, FormEvent>(
      formMachine(
        async (context: FormContext<Collection>) => [
          ...context.data && context.data.name ? [] : [ { field: 'name', message: 'demo-form.name.required' } ],
          ...context.data && context.data.uri ? [] : [ { field: 'uri', message: 'demo-form.uri.required' } ],
        ],
      ).withContext({
        data: mockCollection as any,
        original: mockCollection as any,
        validation: [],
      }),
    );

  });

  it('should be correctly instantiated', () => {

    expect(machine).toBeTruthy();

  });

  it.each([
    [
      [ ],
      FormCleanlinessStates.PRISTINE,
      FormSubmissionStates.NOT_SUBMITTED,
      FormValidationStates.NOT_VALIDATED,
      [],
      mockCollection,
    ],
    [ [ { field: 'uri', value: 'foo' } ], FormCleanlinessStates.DIRTY, FormSubmissionStates.NOT_SUBMITTED, FormValidationStates.VALID, [], { uri: 'foo', name: 'Test' } ],
    [ [ { field: 'uri', value: '' } ], FormCleanlinessStates.PRISTINE, FormSubmissionStates.NOT_SUBMITTED, FormValidationStates.INVALID, [ { field: 'uri', message: 'demo-form.uri.required' } ], mockCollection ],
    [ [ { field: 'name', value: '' } ], FormCleanlinessStates.DIRTY, FormSubmissionStates.NOT_SUBMITTED, FormValidationStates.INVALID, [ { field: 'name', message: 'demo-form.name.required' }, { field: 'uri', message: 'demo-form.uri.required' } ], { uri: '', name: '' } ],
  ])('should handle form updates correctly', (updates, cleanliness, submission, validation, results, data) => {

    machine.start();

    // Send updates
    for(const update of updates) {

      machine.send(FormEvents.FORM_UPDATED, update);

    }

    machine.onTransition((state) => {

      if(state.matches(FormValidationStates.VALID || FormValidationStates.INVALID)){

        // Validation rules should be set correctly
        expect(machine.state.context.validation).toEqual(results);

        // Data should be updated
        expect(machine.state.context.data).toEqual(data);

        // States should be updated
        expect(machine.state.matches(
          submission === FormSubmissionStates.SUBMITTED ?
            FormSubmissionStates.SUBMITTED :
            {
              [FormSubmissionStates.NOT_SUBMITTED]:{
                [FormRootStates.CLEANLINESS]: cleanliness,
                [FormRootStates.VALIDATION]: validation,
              },
            },
        )).toBeTruthy();

      }

    });

  });

  it('should submit when form is valid', (done) => {

    machine.start();

    machine.onTransition((state) => {

      if(state.matches(FormSubmissionStates.NOT_SUBMITTED)){

        done();
        machine.stop();

      }

    });

    machine.send(FormEvents.FORM_UPDATED, { field: 'uri', value: 'foo' });
    machine.send(FormEvents.FORM_SUBMITTED);

  });

  it('should not change original data when form is updated', () => {

    machine.start();

    machine.send(FormEvents.FORM_UPDATED, { field: 'uri', value: 'foo' });

    expect(machine.state.context.original).toEqual(mockCollection);

  });

  it('should not be submitted if form is invalid', (done) => {

    machine.start();

    machine.onTransition((state) => {

      if(state.matches({
        [FormSubmissionStates.NOT_SUBMITTED]:{
          [FormRootStates.CLEANLINESS]: FormCleanlinessStates.PRISTINE,
          [FormRootStates.VALIDATION]: FormValidationStates.NOT_VALIDATED,
        },
      })){

        done();

      }

    });

    machine.send(FormEvents.FORM_UPDATED, { field: 'uri', value: null });
    machine.send(FormEvents.FORM_SUBMITTED);

  });

  it('should run submitter when submitting', (done) => {

    const submitter = jest.fn().mockResolvedValue({ uri: 'bla', name: 'Test' });

    machine = interpret<FormContext<Collection>, any, FormEvent>(
      formMachine(
        async (context: FormContext<Collection>, event: FormEvent) => [],
        submitter,
      )
        .withContext({
          data: mockCollection,
          original: mockCollection,
          validation: [],
        }),
    );

    machine.start();

    machine.onTransition((state) => {

      if(state.matches(FormSubmissionStates.SUBMITTED)){

        expect(submitter).toHaveBeenCalledTimes(1);
        done();

      }

    });

    machine.send(FormEvents.FORM_UPDATED, { field: 'uri', value: 'bla' });
    machine.send(FormEvents.FORM_SUBMITTED);

  });

  it('should use default validator function when set', (done) => {

    machine = interpret<FormContext<Collection>, any, FormEvent>(
      formMachine<Collection>()
        .withContext({
          data: mockCollection,
          original: mockCollection,
          validation: [],
        }),
    );

    machine.start();

    machine.onTransition((state) => {

      if(state.matches({
        [FormSubmissionStates.NOT_SUBMITTED]:{
          [FormRootStates.CLEANLINESS]: FormCleanlinessStates.DIRTY,
          [FormRootStates.VALIDATION]: FormValidationStates.VALID,
        },
      })){

        expect(state.context.validation).toEqual([]);
        done();

      }

    });

    machine.send(FormEvents.FORM_UPDATED, { field: 'uri', value: 'bla' });

  });

  it('should accept string as TData', (done) => {

    machine = interpret<FormContext<string>, any, FormEvent>(
      formMachine<string>()
        .withContext({
          data: 'test',
          original: 'test',
          validation: [],
        }),
    );

    machine.onTransition((state) => {

      if(state.matches({
        [FormSubmissionStates.NOT_SUBMITTED]:{
          [FormRootStates.CLEANLINESS]: FormCleanlinessStates.DIRTY,
          [FormRootStates.VALIDATION]: FormValidationStates.VALID,
        },
      })){

        expect(state.context.validation).toEqual([]);
        done();

      }

    });

    machine.start();

    machine.send(FormEvents.FORM_UPDATED, { field: undefined, value: 'bla' });

  });

  it('should accept empty object as TData', (done) => {

    machine = interpret<FormContext<undefined>, any, FormEvent>(
      formMachine<undefined>()
        .withContext({
          data: undefined,
          original: undefined,
          validation: [],
        }),
    );

    machine.onTransition((state) => {

      if(state.matches({
        [FormSubmissionStates.NOT_SUBMITTED]:{
          [FormRootStates.CLEANLINESS]: FormCleanlinessStates.DIRTY,
          [FormRootStates.VALIDATION]: FormValidationStates.VALID,
        },
      })){

        expect(state.context.validation).toEqual([]);
        done();

      }

    });

    machine.start();

    machine.send(FormEvents.FORM_UPDATED, { field: 'uri', value: 'bla' });

  });

});
