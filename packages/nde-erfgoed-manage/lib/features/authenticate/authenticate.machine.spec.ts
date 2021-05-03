import { FormActors, FormContext, FormEvents, FormRootStates, FormSubmissionStates, FormValidationStates } from '@digita-ai/nde-erfgoed-components';
import { ConsoleLogger, LoggerLevel } from '@digita-ai/nde-erfgoed-core';
import { interpret, Interpreter } from 'xstate';
import { SolidMockService } from '../../common/solid/solid-mock.service';
import { AuthenticateEvents } from './authenticate.events';
import { AuthenticateContext, authenticateMachine, AuthenticateStates } from './authenticate.machine';

describe('AuthenticateMachine', () => {
  let machine: Interpreter<AuthenticateContext>;

  beforeEach(() => {
    const solid = new SolidMockService(new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly));
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

    machine.onTransition(async (machineState) => {
      if (machineState.matches(AuthenticateStates.UNAUTHENTICATED)) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const formActor = machine.children.get(FormActors.FORM_MACHINE) as Interpreter<FormContext<{webId: string}>>;

        // submit when form is valid
        formActor.onTransition((formState) => {
          if (formState.matches({
            [FormSubmissionStates.NOT_SUBMITTED]:{
              [FormRootStates.VALIDATION]: FormValidationStates.VALID,
            },
          })) {
            formActor.send(FormEvents.FORM_SUBMITTED);
          }
        });

        formActor.send({ type: FormEvents.FORM_UPDATED, field: 'webId', value: 'https://pod.inrupt.com/digitatestpod1/profile/card#me' });
      }
    });
  });

  it('should transition to redirecting when login started was emitted', async (done) => {

    machine.onTransition((state) => {
      if(state.matches(AuthenticateStates.REDIRECTING)) {
        done();
      }
    });

    machine.start();
    machine.onTransition(async (machineState) => {
      if (machineState.matches(AuthenticateStates.UNAUTHENTICATED)) {
        await new Promise((resolve) => setTimeout(resolve, 500));
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
      }
    });
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

  it('should dispatch login error when returning invalid session', async (done) => {
    const solid = new SolidMockService(new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly));
    solid.getSession = jest.fn(async () => null);

    machine = interpret<AuthenticateContext>(authenticateMachine(solid).withContext({}));

    machine.onEvent((event) => {
      if(event.type === AuthenticateEvents.LOGIN_ERROR) {
        done();
      }
    });

    machine.start();
  });

  it('should dispatch login error when returning error session', async (done) => {
    const solid = new SolidMockService(new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly));
    solid.getSession = jest.fn(async () => {
      throw new Error();
    });

    machine = interpret<AuthenticateContext>(authenticateMachine(solid).withContext({}));

    machine.onEvent((event) => {
      if(event.type === AuthenticateEvents.LOGIN_ERROR) {
        done();
      }
    });

    machine.start();
  });

  it('should dispatch login success when returning valid session', async (done) => {
    const solid = new SolidMockService(new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly));
    solid.getSession = jest.fn(async () => ({ webId: 'lorem' }));

    machine = interpret<AuthenticateContext>(authenticateMachine(solid).withContext({}));

    machine.onEvent((event) => {
      if(event.type === AuthenticateEvents.LOGIN_SUCCESS) {
        done();
      }
    });

    machine.start();
  });

  it('should assign session when returning valid session', async (done) => {
    const solid = new SolidMockService(new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly));
    solid.getSession = jest.fn(async () => ({ webId: 'lorem' }));

    machine = interpret<AuthenticateContext>(authenticateMachine(solid).withContext({}));

    machine.onChange((context) => {
      if(context.session?.webId === 'lorem') {
        done();
      }
    });

    machine.start();
  });
});
