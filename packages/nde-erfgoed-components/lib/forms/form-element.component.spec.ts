import { Collection } from '@digita-ai/nde-erfgoed-core';
import { Observable, of } from 'rxjs';
import { interpret, Interpreter } from 'xstate';
import { Event } from '../state/event';
import { FormElementComponent } from './form-element.component';
import { FormValidatorResult } from './form-validator-result';
import { FormEvents } from './form.events';
import { FormContext, formMachine } from './form.machine';

describe('FormElementComponent', () => {
  let component: FormElementComponent<Collection>;
  let machine: Interpreter<FormContext<Collection>>;

  beforeEach(() => {
    machine = interpret(
      formMachine<Collection>(
        (context: FormContext<Collection>, event: Event<FormEvents>): Observable<FormValidatorResult[]> => of([
          ...context.data && context.data.name ? [] : [ { field: 'name', message: 'demo-form.name.required' } ],
          ...context.data && context.data.uri ? [] : [ { field: 'uri', message: 'demo-form.uri.required' } ],
        ]),
      )
        .withContext({
          data: { uri: '', name: 'Test' },
          original: { uri: '', name: 'Test' },
          validation: [],
        }),
    );
    component = window.document.createElement('nde-form-element') as FormElementComponent<Collection>;

    component.actor = machine;
    component.field = 'name';
    component.data = { uri: '', name: 'Test' };

    const label = window.document.createElement('label');
    label.innerHTML = 'Foo';
    label.slot = 'label';
    component.appendChild(label);

    const help = window.document.createElement('div');
    help.innerHTML = 'Bar';
    help.slot = 'help';
    component.appendChild(help);

    const icon = window.document.createElement('div');
    icon.innerHTML = 'x';
    icon.slot = 'icon';
    component.appendChild(icon);

    const action = window.document.createElement('button');
    action.innerHTML = 'go';
    action.slot = 'action';
    component.appendChild(action);

    const input = window.document.createElement('input');
    input.type = 'text';
    input.slot = 'input';
    component.appendChild(input);
  });

  afterEach(() => {
    document.getElementsByTagName('html')[0].innerHTML = '';
  });

  it('should be correctly instantiated', () => {
    expect(component).toBeTruthy();
  });

  it('should set default value on slotted input field', async () => {
    window.document.body.appendChild(component);
    await component.updateComplete;

    expect((window.document.body.getElementsByTagName('nde-form-element')[0].shadowRoot.querySelector<HTMLSlotElement>('.input slot').assignedElements()[0] as HTMLInputElement).value).toBe('Test');
  });

  xit('should send event when updating slotted input field', async (done) => {
    machine.onEvent(((event) => {
      if(event.type === FormEvents.FORM_UPDATED) {
        done();
      }
    }));

    window.document.body.appendChild(component);
    await component.updateComplete;

    const input = window.document.body.getElementsByTagName('nde-form-element')[0].shadowRoot.querySelector<HTMLSlotElement>('.input slot').assignedElements()[0] as HTMLInputElement;

    input.value = 'Lorem';
    input.dispatchEvent(new Event('input'));
  });

  it('should show validation results', async () => {
    component.validationResults = [ {field: 'name', message: 'lorem'} ];

    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(window.document.body.getElementsByTagName('nde-form-element')[0].shadowRoot.querySelectorAll<HTMLSlotElement>('.results .result').length).toBe(1);
    expect(window.document.body.getElementsByTagName('nde-form-element')[0].shadowRoot.querySelectorAll<HTMLSlotElement>('.help[hidden]').length).toBe(1);
  });

  it('should show static slotted content', async () => {
    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(window.document.body.getElementsByTagName('nde-form-element')[0].shadowRoot.querySelector<HTMLSlotElement>('.help slot').assignedElements().length).toBe(1);
    expect(window.document.body.getElementsByTagName('nde-form-element')[0].shadowRoot.querySelector<HTMLSlotElement>('.label slot').assignedElements().length).toBe(1);
    expect(window.document.body.getElementsByTagName('nde-form-element')[0].shadowRoot.querySelector<HTMLSlotElement>('.icon slot').assignedElements().length).toBe(1);
    expect(window.document.body.getElementsByTagName('nde-form-element')[0].shadowRoot.querySelector<HTMLSlotElement>('.action slot').assignedElements().length).toBe(1);
  });
});
