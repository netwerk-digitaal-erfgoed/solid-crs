import { FormActors, FormContext, FormEvents, FormRootStates, FormSubmissionStates, FormValidationStates } from '@digita-ai/nde-erfgoed-components';
import { ConsoleLogger, LoggerLevel, SolidMockService } from '@digita-ai/nde-erfgoed-core';
import { interpret, Interpreter } from 'xstate';
import { AuthenticateEvents } from './authenticate.events';
import { AuthenticateContext, authenticateMachine, AuthenticateStates } from './authenticate.machine';

const solid = new SolidMockService(new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly));

describe('AuthenticateMachine', () => {
  let machine: Interpreter<AuthenticateContext>;

  beforeEach(() => {
    machine = interpret<AuthenticateContext>(authenticateMachine(solid).withContext({}));
  });

  it('should be correctly instantiated', () => {
    expect(machine).toBeTruthy();
  });

  it('should emit login error event when cannot handle incoming redirect', async (done) => {
    machine.onEvent(((event) => {
      if(event.type === AuthenticateEvents.LOGIN_ERROR) {
        done();
      }
    }));

    machine.start();
  });

  it('should emit login started event when webId form was successfully submitted', async (done) => {
    machine.onEvent(((event) => {
      if(event.type === AuthenticateEvents.LOGIN_STARTED) {
        done();
      }
    }));

    machine.start();
    const formActor = machine.children.get(FormActors.FORM_MACHINE) as Interpreter<FormContext<{webId: string}>>;

    // submit when form is valid
    formActor.onTransition((state) => {
      if (state.matches({
        [FormSubmissionStates.NOT_SUBMITTED]:{
          [FormRootStates.VALIDATION]: FormValidationStates.VALID,
        },
      })) {
        formActor.send(FormEvents.FORM_SUBMITTED);
      }
    });

    formActor.send({ type: FormEvents.FORM_UPDATED, field: 'webId', value: 'https://pod.inrupt.com/digitatestpod1/profile/card#me' });
  });

  it('should transition to redirecting when login started was emitted', async (done) => {

    machine.onTransition((state) => {
      if(state.matches(AuthenticateStates.REDIRECTING)) {
        done();
      }
    });

    machine.start();
    const formActor = machine.children.get(FormActors.FORM_MACHINE) as Interpreter<FormContext<{webId: string}>>;

    // submit when form is valid
    formActor.onTransition((state) => {
      if (state.matches({
        [FormSubmissionStates.NOT_SUBMITTED]:{
          [FormRootStates.VALIDATION]: FormValidationStates.VALID,
        },
      })) {
        formActor.send(FormEvents.FORM_SUBMITTED);
      }
    });

    formActor.send({ type: FormEvents.FORM_UPDATED, field: 'webId', value: 'https://pod.inrupt.com/digitatestpod1/profile/card#me' });

  });

  it('should transition to authenticated when login success was emitted', async (done) => {
    machine.onTransition((state) => {
      if(state.matches(AuthenticateStates.AUTHENTICATED)) {
        done();
      }
    });

    machine.start();
    machine.send(AuthenticateEvents.LOGIN_SUCCESS);
  });

  // it('should emit login error event when cannot handle incoming redirect', () => {
  //   machine.start();

  //   machine.send(FormEvents.FORM_UPDATED, {field: 'uri', value: 'foo'});
  //   machine.send(FormEvents.FORM_SUBMITTED);

  //   expect(machine.state.matches(FormSubmissionStates.SUBMITTED)).toBeTruthy();
  // });
});
