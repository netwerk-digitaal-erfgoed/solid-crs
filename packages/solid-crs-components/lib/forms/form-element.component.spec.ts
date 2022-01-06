/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArgumentError } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { of } from 'rxjs';
import { interpret, Interpreter } from 'xstate';
import { State } from '../state/state';
import { FormElementComponent } from './form-element.component';
import { FormValidatorResult } from './form-validator-result';
import { FormEvent, FormEvents, FormUpdatedEvent } from './form.events';
import { FormContext, formMachine, FormStates } from './form.machine';

describe('FormElementComponent', () => {

  let component: FormElementComponent<any>;
  let machine: Interpreter<FormContext<any>, State<FormStates, FormContext<unknown>>, FormEvent>;
  let input: HTMLInputElement;

  beforeEach(async () => {

    machine = interpret(
      formMachine<any>(
        async (context: FormContext<any>): Promise<FormValidatorResult[]> => ([
          ...context.data && context.data.name ? [] : [ { field: 'name', message: 'demo-form.name.required' } ],
          ...context.data && context.data.uri ? [] : [ { field: 'uri', message: 'demo-form.uri.required' } ],
        ]),
      )
        .withContext({
          data: { uri: '', name: 'Test', description: 'description', weight: 321, selected: [ '1' ] },
          original: { uri: '', name: 'Test', description: 'description', weight: 321, selected: [ '1' ] },
          validation: [ { field: 'name', message: 'lorem' } ],
        }),
    );

    component = document.createElement('nde-form-element') as FormElementComponent<any>;

    component.actor = machine;
    component.field = 'name';
    component.data = { uri: '', name: 'Test', description: 'description', selected: [ '1' ] };

    const label = document.createElement('label');
    label.innerHTML = 'Foo';
    label.slot = 'label';
    component.appendChild(label);

    const help = document.createElement('div');
    help.innerHTML = 'Bar';
    help.slot = 'help';
    component.appendChild(help);

    const icon = document.createElement('div');
    icon.innerHTML = 'x';
    icon.slot = 'icon';
    component.appendChild(icon);

    const action = document.createElement('button');
    action.innerHTML = 'go';
    action.slot = 'action';
    component.appendChild(action);

    input = document.createElement('input');
    input.type = 'text';
    input.slot = 'input';
    component.appendChild(input);

    component.translator = {
      translate: jest.fn(() => 'translation'),
    } as any;

    jest.clearAllMocks();

    document.body.appendChild(component);
    await component.updateComplete;

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

  describe('with regular input field', () => {

    it('should set default value on slotted text input field', async () => {

      document.body.appendChild(component);
      await component.updateComplete;

      expect(input.value).toBe('Test');

    });

    it('should allow slotted textarea field', async () => {

      component.field = 'description';
      const select = document.createElement('textarea');
      select.slot = 'input';
      select.innerText = 'test description';
      component.appendChild(select);
      component.removeChild(input);

      await component.updateComplete;

      expect((component.shadowRoot.querySelector<HTMLSlotElement>('.field slot').assignedElements()[0] as HTMLSelectElement).innerText).toEqual(select.innerText);

    });

    it('should send event when updating slotted text input field', (done) => {

      machine.onEvent(((event) => {

        if(event instanceof FormUpdatedEvent) {

          if (event.value === 'Lorem') {

            done();

          }

        }

      }));

      machine.start();

      // const input = document.body.getElementsByTagName('nde-form-element')[0].shadowRoot.querySelector<HTMLSlotElement>('.input slot').assignedElements()[0] as HTMLInputElement;

      input.value = 'Lorem';
      input.dispatchEvent(new Event('input'));

    });

    it('should send event when updating slotted number input field', (done) => {

      machine.onEvent(((event) => {

        if(event instanceof FormUpdatedEvent) {

          if (+event.value === 123) {

            done();

          }

        }

      }));

      machine.start();

      component.field = 'weight';

      input.type = 'number';
      (input.value as any) = 123;
      input.dispatchEvent(new Event('input'));

    });

  });

  describe('with <select> input field', () => {

    it('should allow slotted select field', async () => {

      component.field = 'description';
      const select = document.createElement('select');
      select.slot = 'input';
      const option = document.createElement('option');
      option.id = 'description';
      select.appendChild(option);
      component.appendChild(select);
      component.removeChild(input);

      document.body.appendChild(component);
      await component.updateComplete;

      expect((document.body.getElementsByTagName('nde-form-element')[0].shadowRoot.querySelector<HTMLSlotElement>('.field slot').assignedElements()[0] as HTMLSelectElement).children.length).toBe(1);

    });

  });

  describe('with checkbox dropdown input field', () => {

    let ul: HTMLUListElement;
    let titleListItem: HTMLLIElement;
    let inputListItem: HTMLLIElement;
    let inputLabel: HTMLLabelElement;

    beforeEach(async() => {

      component.removeChild(input);
      component.field = 'selected';
      ul = document.createElement('ul');
      ul.slot = 'input';
      ul.type = 'multiselect';
      titleListItem = document.createElement('li');
      titleListItem.setAttribute('for', 'title');
      inputListItem = document.createElement('li');
      inputLabel = document.createElement('label');
      inputLabel.htmlFor = 'selected';
      input.type = 'checkbox';
      input.id = '1';
      input.value = '1';
      input.name = 'selected';
      inputListItem.appendChild(input);
      inputListItem.appendChild(inputLabel);
      ul.appendChild(titleListItem);
      ul.appendChild(inputListItem);
      component.appendChild(ul);
      machine.start();

      component.bindActorToInput(component.inputSlot, component.actor, component.field, component.data);

    });

    it('should allow slotted <ul> <li> with checkbox input fields', () => {

      expect((document.body.getElementsByTagName('nde-form-element')[0].shadowRoot.querySelector<HTMLSlotElement>('.field slot').assignedElements()[0] as HTMLSelectElement)).toEqual(ul);

    });

    it('should hide checkboxes by default', () => {

      expect(inputListItem.hidden).toBeTruthy();
      expect(titleListItem.hidden).toBeFalsy();

    });

    it('should show checkboxes when title is clicked', () => {

      titleListItem.click();
      expect(inputListItem.hidden).toBeFalsy();
      expect(titleListItem.hidden).toBeTruthy();

    });

    it('should send FORM_UPDATED event when focus is lost on dropdown', (done) => {

      input.checked = true;

      machine.onEvent((event) => {

        if (event instanceof FormUpdatedEvent && event) {

          done();

        }

      });

      component.dispatchEvent(new FocusEvent('focusout'));

    });

    it('should show title when focus was lost on the checkbox list', () => {

      // show the checkboxes
      titleListItem.click();
      expect(inputListItem.hidden).toBeFalsy();
      expect(titleListItem.hidden).toBeTruthy();

      // click somewhere else
      component.dispatchEvent(new FocusEvent('focusout'));
      expect(inputListItem.hidden).toBeTruthy();
      expect(titleListItem.hidden).toBeFalsy();

    });

    it('should not lose focus when other checkboxes are clicked', () => {

      // show the checkboxes
      titleListItem.click();
      expect(inputListItem.hidden).toBeFalsy();
      expect(titleListItem.hidden).toBeTruthy();

      // click on a checkbox
      component.dispatchEvent(new FocusEvent('focusout', { relatedTarget: input }));
      expect(inputListItem.hidden).toBeFalsy();
      expect(titleListItem.hidden).toBeTruthy();

    });

    it('should error when fieldData is not an array', async () => {

      component.data = { uri: '', name: 'Test', description: 'description', selected: 'no-array' };

      expect(() => component.bindActorToInput(component.inputSlot, component.actor, component.field, component.data))
        .toThrow();

    });

    it('should show default message when no checkboxes are selected', () => {

      component.data = { uri: '', name: 'Test', description: 'description', selected: [] };

      input.click();
      input.click();

      expect(titleListItem.textContent).toContain('translation');

    });

  });

  it('should send SUBMITTED event when enter keypress', (done) => {

    machine.onEvent(((event) => {

      if(event.type === FormEvents.FORM_SUBMITTED) {

        done();

      }

    }));

    machine.start();

    component.submitOnEnter = true;
    component.validationResults = [];
    component.isValid = true;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

  });

  it('should show validation results', async () => {

    component.validationResults = [ { field: 'name', message: 'lorem' } ];

    document.body.appendChild(component);
    await component.updateComplete;

    expect(document.body.getElementsByTagName('nde-form-element')[0].shadowRoot.querySelectorAll<HTMLSlotElement>('.results .result').length).toBe(1);
    expect(document.body.getElementsByTagName('nde-form-element')[0].shadowRoot.querySelectorAll<HTMLSlotElement>('.help[hidden]').length).toBe(1);

  });

  it('should show yellow border when hideValidation is true', async () => {

    component.validationResults = [ { field: 'name', message: 'lorem' } ];
    component.hideValidation = true;

    document.body.appendChild(component);
    await component.updateComplete;

    expect(document.body.getElementsByTagName('nde-form-element')[0].shadowRoot.querySelector<HTMLDivElement>('.results').hidden).toBeTruthy();
    expect(document.body.getElementsByTagName('nde-form-element')[0].shadowRoot.querySelector<HTMLDivElement>('.content').classList).toContain('no-validation');

  });

  it('should show static slotted content', async () => {

    document.body.appendChild(component);
    await component.updateComplete;

    expect(document.body.getElementsByTagName('nde-form-element')[0].shadowRoot.querySelector<HTMLSlotElement>('.help slot').assignedElements().length).toBe(1);
    expect(document.body.getElementsByTagName('nde-form-element')[0].shadowRoot.querySelector<HTMLSlotElement>('.label slot').assignedElements().length).toBe(1);
    expect(document.body.getElementsByTagName('nde-form-element')[0].shadowRoot.querySelector<HTMLSlotElement>('.icon slot').assignedElements().length).toBe(1);
    expect(document.body.getElementsByTagName('nde-form-element')[0].shadowRoot.querySelector<HTMLSlotElement>('.action slot').assignedElements().length).toBe(1);

  });

  it('should show loading when validating is true', async () => {

    component.showLoading = true;

    document.body.appendChild(component);
    await component.updateComplete;

    expect(document.body.getElementsByTagName('nde-form-element')[0].shadowRoot.querySelectorAll<HTMLDivElement>('.icon .loading').length).toEqual(1);

  });

  it('should not show loading when validating is false', async () => {

    component.showLoading = false;

    document.body.appendChild(component);
    await component.updateComplete;

    expect(document.body.getElementsByTagName('nde-form-element')[0].shadowRoot.querySelectorAll<HTMLDivElement>('.icon .loading').length).toEqual(0);

  });

  it('should show icon when not loading', async () => {

    component.showLoading = false;

    document.body.appendChild(component);
    await component.updateComplete;

    expect(document.body.getElementsByTagName('nde-form-element')[0].shadowRoot.querySelectorAll<HTMLDivElement>('.icon slot[name="icon"]').length).toEqual(1);

  });

  it('should not show icon when loading', async () => {

    component.showLoading = true;

    document.body.appendChild(component);
    await component.updateComplete;

    expect(document.body.getElementsByTagName('nde-form-element')[0].shadowRoot.querySelectorAll<HTMLDivElement>('.icon slot[name="icon"]').length).toEqual(0);

  });

  it('should disable input when locked', async () => {

    component.lockInput = true;

    document.body.appendChild(component);
    await component.updateComplete;

    expect(input.disabled).toBeTruthy();

  });

  it('should enable input when not locked', async () => {

    component.lockInput = false;

    document.body.appendChild(component);
    await component.updateComplete;

    expect(input.disabled).toBeFalsy();

  });

  it('should set this.inverse when form element has inverse class', async () => {

    component.className += ' inverse';

    component.updated(new Map());

    expect(component.inverse).toBeTruthy();

  });

  describe('bindActorToInput', () => {

    const slot: HTMLSlotElement = {
      ...document.createElement('input'),
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
