import { Alert } from '@digita-ai/nde-erfgoed-components';
import { interpret, Interpreter } from 'xstate';
import { AppContext } from './app.context';
import { AppEvent, AppEvents } from './app.events';
import { appMachine } from './app.machine';
import { AppSchema, AppState } from './app.states';

describe('AppMachine', () => {
  let machine: Interpreter<AppContext, AppSchema, AppEvent, AppState>;

  beforeEach(() => {
    machine = interpret<AppContext, any, AppEvent, AppState>(appMachine.withContext({
      alerts: [],
    }));
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
    machine = interpret<AppContext, any, AppEvent, AppState>(appMachine.withContext({
      alerts: [ alert ],
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
    machine = interpret<AppContext, any, AppEvent, AppState>(appMachine.withContext({
      alerts: [ alert ],
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
});
