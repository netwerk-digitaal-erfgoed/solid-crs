import { ArgumentError, MemoryTranslator } from '@digita-ai/nde-erfgoed-core';
import {AlertComponent} from './alert.component';

describe('AlertComponent', () => {
  let component: AlertComponent;

  beforeEach(() => {
    component = window.document.createElement('nde-alert') as AlertComponent;
    (component as any).createRenderRoot = () => this;
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
    component.translator = new MemoryTranslator([ {key: 'foo', value:'bar', locale:'en-GB'} ], 'en-GB');

    window.document.body.appendChild(component);
    await component.updateComplete;

    const message = window.document.body.getElementsByTagName('nde-alert')[0].shadowRoot.querySelector('.message').innerHTML.replace(/<!---->/g, '');

    expect(message).toBe('bar');
  });

  it('should not print message when translator is set and translation is found', async () => {
    component.alert = {
      type: 'success',
      message: 'foo',
    };
    component.translator = new MemoryTranslator([ {key: 'lorem', value:'bar', locale:'en-GB'} ], 'en-GB');

    window.document.body.appendChild(component);
    await component.updateComplete;

    const message = window.document.body.getElementsByTagName('nde-alert')[0].shadowRoot.querySelector('.message').innerHTML.replace(/<!---->/g, '');

    expect(message.trim()).toBe('');
  });

  it('should be assigned the appropriate class when success', async () => {
    component.alert = {
      type: 'success',
      message: 'Foo',
    };

    window.document.body.appendChild(component);
    await component.updateComplete;

    const alert = window.document.body.getElementsByTagName('nde-alert')[0].shadowRoot.querySelector('.alert.success');

    expect(alert).toBeTruthy();
  });

  it('should be assigned the appropriate class when warning', async () => {
    component.alert = {
      type: 'warning',
      message: 'Foo',
    };

    window.document.body.appendChild(component);
    await component.updateComplete;

    const alert = window.document.body.getElementsByTagName('nde-alert')[0].shadowRoot.querySelector('.alert.warning');

    expect(alert).toBeTruthy();
  });

  it('should be assigned the appropriate class when danger', async () => {
    component.alert = {
      type: 'danger',
      message: 'Foo',
    };

    window.document.body.appendChild(component);
    await component.updateComplete;

    const alert = window.document.body.getElementsByTagName('nde-alert')[0].shadowRoot.querySelector('.alert.danger');

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
    const mock = jest.fn();

    component.alert = {
      type: null,
      message: 'Foo',
    };

    component.dismiss = mock;

    window.document.body.appendChild(component);
    await component.updateComplete;

    const dismiss = window.document.body.getElementsByTagName('nde-alert')[0].shadowRoot.querySelector('.dismiss') as HTMLElement;
    dismiss.click();

    expect(mock.mock.calls.length).toEqual(1);
  });

  it('should dispatch event when dismiss is clicked', async () => {
    const mock = jest.fn();

    component.alert = {
      type: null,
      message: 'Foo',
    };

    component.dispatchEvent = mock;

    window.document.body.appendChild(component);
    await component.updateComplete;

    const dismiss = window.document.body.getElementsByTagName('nde-alert')[0].shadowRoot.querySelector('.dismiss') as HTMLElement;
    dismiss.click();

    expect(mock.mock.calls.length).toEqual(1);
  });

  it('should throw error when dismiss is clicked when no alert is set', async () => {
    component.alert = null;

    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(()=>component.dismiss()).toThrow(ArgumentError);
  });
});
