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

  it('should throw error when sending addAlert without payload', () => {
    machine.start();
    expect(() => machine.send(AppEvents.ADD_ALERT, {})).toThrow();
  });
});
