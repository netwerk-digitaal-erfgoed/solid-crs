import { Alert } from '@digita-ai/nde-erfgoed-components';
import { ConsoleLogger, LoggerLevel, SolidMockService } from '@digita-ai/nde-erfgoed-core';
import { interpret, Interpreter } from 'xstate';
import { AppEvents } from './app.events';
import { AppContext, appMachine } from './app.machine';

describe('AppMachine', () => {
  let machine: Interpreter<AppContext>;

  beforeEach(() => {
    machine = interpret<AppContext>(
      appMachine(
        new SolidMockService(new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly)),
      )
        .withContext({
          alerts: [],
        }),
    );
  });

  it('should be correctly instantiated', () => {
    expect(machine).toBeTruthy();
  });

  it('should add alert to context when sending addAlert', () => {
    const alert = {type: 'success', message: 'foo'};
    machine.start();
    machine.send(AppEvents.ADD_ALERT, {alert});

    expect(machine.state.context.alerts).toBeTruthy();
    expect(machine.state.context.alerts.length).toBe(1);
    expect(machine.state.context.alerts[0]).toEqual(alert);
  });

  it('should not add duplicate alert to context when sending addAlert', () => {
    const alert: Alert = {type: 'success', message: 'foo'};
    machine = interpret<AppContext>(appMachine(
      new SolidMockService(new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly)),
    ).withContext({
      alerts: [ alert ],
      session: null,
      loggedIn: false,
    }));
    machine.start();
    machine.send(AppEvents.ADD_ALERT, { alert });

    expect(machine.state.context.alerts).toBeTruthy();
    expect(machine.state.context.alerts.length).toBe(1);
    expect(machine.state.context.alerts[0]).toEqual(alert);
  });

  it('should send error event when sending addAlert without payload', async (done) => {
    machine.start();

    machine.onEvent(((event) => {
      if(event.type === AppEvents.ERROR) {
        done();
      }
    }));

    machine.send(AppEvents.ADD_ALERT, {});
  });

  it('should dismiss alert in context when sending dismissAlert', () => {
    const alert: Alert = {type: 'success', message: 'foo'};
    machine = interpret<AppContext>(appMachine(
      new SolidMockService(new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly)),
    )
      .withContext({
        alerts: [ alert ],
        session: null,
        loggedIn: false,
      }));
    machine.start();
    expect(machine.state.context.alerts.length).toBe(1);
    machine.send(AppEvents.DISMISS_ALERT, { alert });
    expect(machine.state.context.alerts.length).toBe(0);
  });

  it('should not dismiss non-existing alert in context when sending dismissAlert', () => {
    const alert: Alert = {type: 'success', message: 'foo'};
    machine.start();
    expect(machine.state.context.alerts.length).toBe(0);
    machine.send(AppEvents.DISMISS_ALERT, { alert });
    expect(machine.state.context.alerts.length).toBe(0);
  });

  it('should send error event when sending dismissAlert without payload', async (done) => {
    machine.start();

    machine.onEvent(((event) => {
      if(event.type === AppEvents.ERROR) {
        done();
      }
    }));

    machine.send(AppEvents.DISMISS_ALERT, {});
  });

  it('should send add alert event when error event is sent', async (done) => {
    machine.start();

    machine.onEvent(((event) => {
      if(event.type === AppEvents.ADD_ALERT) {
        done();
      }
    }));

    machine.send(AppEvents.ERROR);
  });

  it('should assign session when logged in', async (done) => {
    machine.onChange((context) => {
      if(context.session?.webId === 'lorem') {
        done();
      }
    });

    machine.start();

    machine.send({ type:AppEvents.LOGGED_IN, session: { webId: 'lorem' } });
  });

  it('should send logged in when authenticate machine is done', async (done) => {
    const solid = new SolidMockService(new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly));
    solid.getSession = jest.fn(async () => ({ webId: 'lorem' }));

    machine = interpret<AppContext>(
      appMachine(solid)
        .withContext({
          alerts: [],
        }),
    );

    machine.onEvent((event) => {
      if(event.type === AppEvents.LOGGED_IN && event.session?.webId === 'lorem') {
        done();
      }
    });

    machine.start();
  });
});
