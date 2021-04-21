import { Alert } from '@digita-ai/nde-erfgoed-components';
import { ArgumentError } from '@digita-ai/nde-erfgoed-core';
import { interpret, Interpreter } from 'xstate';
import { AppContext } from './app.context';
import { AppEvent, AppEvents } from './app.events';
import { appMachine } from './app.machine';
import { AppSchema, AppState } from './app.states';

describe('AlertComponent', () => {
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

  it('should throw error when sending addAlert without payload', () => {
    machine.start();
    expect(() => machine.send(AppEvents.ADD_ALERT, {})).toThrow(ArgumentError);
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

  it('should throw error when sending dismissAlert without payload', () => {
    machine.start();
    expect(() => machine.send(AppEvents.DISMISS_ALERT, {})).toThrow(ArgumentError);
  });
});
