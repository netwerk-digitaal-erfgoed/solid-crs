import { ArgumentError, MockTranslator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { Alert } from './alert';
import { AlertComponent } from './alert.component';

describe('AlertComponent', () => {

  let component: AlertComponent;

  beforeEach(() => {

    component = window.document.createElement('nde-alert') as AlertComponent;
    fetchMock.resetMocks();

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

  it('should print message when no translator is set', async () => {

    component.alert = {
      type: 'success',
      message: 'Foo',
    };

    window.document.body.appendChild(component);
    await component.updateComplete;

    const message = window.document.body.getElementsByTagName('nde-alert')[0].shadowRoot.querySelector('.message').innerHTML.replace(/<!---->/g, '');

    expect(message).toBe('Foo');

  });

  it('should translate message when translator is set and translation is found', async () => {

    component.alert = {
      type: 'success',
      message: 'foo',
    };

    component.translator = new MockTranslator('nl-NL');

    window.document.body.appendChild(component);
    await component.updateComplete;

    const message = window.document.body.getElementsByTagName('nde-alert')[0].shadowRoot.querySelector('.message').innerHTML.replace(/<!---->/g, '');

    expect(message).toBe('foo');

  });

  it.each([ 'success', 'warning', 'danger' ])('should be assigned the appropriate class when %s', async (type) => {

    component.alert = {
      type: type as 'success' | 'warning' | 'danger',
      message: 'Foo',
    };

    window.document.body.appendChild(component);
    await component.updateComplete;

    const alert = window.document.body.getElementsByTagName('nde-alert')[0].shadowRoot.querySelector(`.alert.${type}`);

    expect(alert).toBeTruthy();

  });

  it('should be assigned the appropriate class when no type set', async () => {

    component.alert = {
      type: null,
      message: 'Foo',
    };

    window.document.body.appendChild(component);
    await component.updateComplete;

    const alert = window.document.body.getElementsByTagName('nde-alert')[0].shadowRoot.querySelector('.alert.warning');

    expect(alert).toBeTruthy();

  });

  it('should call dismiss when dismiss is clicked', async () => {

    component.alert = {
      type: 'success',
      message: 'Foo',
    };

    component.dismiss = jest.fn();

    window.document.body.appendChild(component);
    await component.updateComplete;

    const dismiss = window.document.body.getElementsByTagName('nde-alert')[0].shadowRoot.querySelector('.dismiss') as HTMLElement;
    dismiss.click();

    expect(component.dismiss).toHaveBeenCalledTimes(1);

  });

  it('should dispatch event when dismiss is clicked', async () => {

    component.alert = {
      type: 'success',
      message: 'Foo',
    };

    component.dispatchEvent = jest.fn();

    window.document.body.appendChild(component);
    await component.updateComplete;

    const dismiss = window.document.body.getElementsByTagName('nde-alert')[0].shadowRoot.querySelector('.dismiss') as HTMLElement;
    dismiss.click();

    expect(component.dispatchEvent).toHaveBeenCalledTimes(1);
    expect(component.dispatchEvent).toHaveBeenCalledWith(new CustomEvent<Alert>('dismiss', { detail: component.alert }));

  });

  it('should throw error when dismiss is clicked when no alert is set', async () => {

    component.alert = null;

    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(() => component.dismiss()).toThrow(ArgumentError);

  });

});
