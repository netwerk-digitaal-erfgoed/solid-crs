import { interpret, Interpreter } from 'xstate';
import { CollectionRootComponent } from './collection-root.component';
import { CollectionContext, collectionMachine } from './collection.machine';

describe('CollectionRootComponent', () => {
  let component: CollectionRootComponent;
  let machine: Interpreter<CollectionContext>;

  beforeEach(() => {
    machine = interpret(collectionMachine);
    component = window.document.createElement('nde-collections-root') as CollectionRootComponent;

    component.actor = machine;
  });

  afterEach(() => {
    document.getElementsByTagName('html')[0].innerHTML = '';
  });

  it('should be correctly instantiated', () => {
    expect(component).toBeTruthy();
  });

  it('should show alerts when set', async () => {
    component.alerts = [ {
      type: 'success',
      message: 'Foo',
    } ];

    window.document.body.appendChild(component);
    await component.updateComplete;

    const alerts = window.document.body.getElementsByTagName('nde-collections-root')[0].shadowRoot.querySelectorAll('nde-alert');

    expect(alerts).toBeTruthy();
    expect(alerts.length).toBe(1);
  });

  it('should not show alerts when unset', async () => {
    component.alerts = null;

    window.document.body.appendChild(component);
    await component.updateComplete;

    const alerts = window.document.body.getElementsByTagName('nde-collections-root')[0].shadowRoot.querySelectorAll('nde-alert');

    expect(alerts).toBeTruthy();
    expect(alerts.length).toBe(0);
  });
});
