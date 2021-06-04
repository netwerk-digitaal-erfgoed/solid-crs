import { ArgumentError, Collection } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { of } from 'rxjs';
import { interpret, Interpreter } from 'xstate';
import { FormElementComponent } from './form-element.component';
import { FormValidatorResult } from './form-validator-result';
import { FormEvent, FormEvents } from './form.events';
import { FormContext, formMachine } from './form.machine';

describe('FormElementComponent', () => {

  let component: FormElementComponent<Collection>;
  let machine: Interpreter<FormContext<Collection>>;
  let input;

  beforeEach(() => {

    machine = interpret(
      formMachine<Collection>(
        async (context: FormContext<Collection>, event: FormEvent): Promise<FormValidatorResult[]> => ([
          ...context.data && context.data.name ? [] : [ { field: 'name', message: 'demo-form.name.required' } ],
          ...context.data && context.data.uri ? [] : [ { field: 'uri', message: 'demo-form.uri.required' } ],
        ]),
      )
        .withContext({
          data: { uri: '', name: 'Test', description: 'description' },
          original: { uri: '', name: 'Test', description: 'description' },
          validation: [ { field: 'name', message: 'lorem' } ],
        }),
    );

    component = window.document.createElement('nde-form-element') as FormElementComponent<Collection>;

    component.actor = machine;
    component.field = 'name';
    component.data = { uri: '', name: 'Test', description: 'description' };

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

    input = window.document.createElement('input');
    input.type = 'text';
    input.slot = 'input';
    component.appendChild(input);

    jest.clearAllMocks();

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

    expect((window.document.body.getElementsByTagName('nde-form-element')[0].shadowRoot.querySelector<HTMLSlotElement>('.field slot').assignedElements()[0] as HTMLInputElement).value).toBe('Test');

  });

  it('should allow slotted select field', async () => {

    component.field = 'description';
    const select = window.document.createElement('select');
    select.slot = 'input';
    const option = window.document.createElement('option');
    option.id = 'description';
    select.appendChild(option);
    component.appendChild(select);
    component.removeChild(input);

    window.document.body.appendChild(component);
    await component.updateComplete;

    expect((window.document.body.getElementsByTagName('nde-form-element')[0].shadowRoot.querySelector<HTMLSlotElement>('.field slot').assignedElements()[0] as HTMLSelectElement).children.length).toBe(1);

  });

  it('should allow slotted textarea field', async () => {

    component.field = 'description';
    const select = window.document.createElement('textarea');
    select.slot = 'input';
    select.innerText = 'test description';
    component.appendChild(select);
    component.removeChild(input);

    window.document.body.appendChild(component);
    await component.updateComplete;

    expect((window.document.body.getElementsByTagName('nde-form-element')[0].shadowRoot.querySelector<HTMLSlotElement>('.field slot').assignedElements()[0] as HTMLSelectElement).innerText).toEqual(select.innerText);

  });

  it('should send SUBMITTED event when enter keypress', async (done) => {

    machine.onEvent(((event) => {

      if(event.type === FormEvents.FORM_SUBMITTED) {

        done();

      }

    }));

    machine.start();

    component.submitOnEnter = true;
    window.document.body.appendChild(component);
    await component.updateComplete;

    component.validationResults = [];
    input.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter' }));

  });

  xit('should send event when updating slotted input field', async (done) => {

    machine.onEvent(((event) => {

      if(event.type === FormEvents.FORM_UPDATED) {

        done();

      }

    }));

    window.document.body.appendChild(component);
    await component.updateComplete;

    // const input = window.document.body.getElementsByTagName('nde-form-element')[0].shadowRoot.querySelector<HTMLSlotElement>('.input slot').assignedElements()[0] as HTMLInputElement;

    input.value = 'Lorem';
    input.dispatchEvent(new Event('input'));

  });

  it('should show validation results', async () => {

    component.validationResults = [ { field: 'name', message: 'lorem' } ];

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

  it('should show loading when validating is true', async () => {

    component.showLoading = true;

    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(window.document.body.getElementsByTagName('nde-form-element')[0].shadowRoot.querySelectorAll<HTMLDivElement>('.icon .loading').length).toEqual(1);

  });

  it('should not show loading when validating is false', async () => {

    component.showLoading = false;

    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(window.document.body.getElementsByTagName('nde-form-element')[0].shadowRoot.querySelectorAll<HTMLDivElement>('.icon .loading').length).toEqual(0);

  });

  it('should show icon when not loading', async () => {

    component.showLoading = false;

    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(window.document.body.getElementsByTagName('nde-form-element')[0].shadowRoot.querySelectorAll<HTMLDivElement>('.icon slot[name="icon"]').length).toEqual(1);

  });

  it('should not show icon when loading', async () => {

    component.showLoading = true;

    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(window.document.body.getElementsByTagName('nde-form-element')[0].shadowRoot.querySelectorAll<HTMLDivElement>('.icon slot[name="icon"]').length).toEqual(0);

  });

  it('should disable input when locked', async () => {

    component.lockInput = true;

    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(input.disabled).toBeTruthy();

  });

  it('should enable input when not locked', async () => {

    component.lockInput = false;

    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(input.disabled).toBeFalsy();

  });

  describe('bindActorToInput', () => {

    const slot: HTMLSlotElement = {
      ...window.document.createElement('input'),
      assignedElements: jest.fn(),
      assignedNodes: jest.fn(),
    };

    const actor = interpret(formMachine<any>((context, event): any => of([])));
    const data = { name: '', description: '', uri: '' };

    it('should throw when slot in undefined', async() => {

      expect(() => component.bindActorToInput(
        undefined, actor, 'name', data,
      )).toThrow(ArgumentError);

    });

    it('should throw when actor in undefined', async() => {

      expect(() => component.bindActorToInput(
        slot, undefined, 'name', data,
      )).toThrow(ArgumentError);

    });

    it('should throw when field in undefined', async() => {

      expect(() => component.bindActorToInput(
        slot, actor, undefined, data,
      )).toThrow(ArgumentError);

    });

    it('should throw when data in undefined', async() => {

      expect(() => component.bindActorToInput(
        slot, actor, 'name', undefined,
      )).toThrow(ArgumentError);

    });

  });

});
