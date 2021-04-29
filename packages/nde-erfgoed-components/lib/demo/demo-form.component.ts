import { css, html, internalProperty, property, PropertyValues } from 'lit-element';
import { ArgumentError, Collection, MemoryTranslator, Translator } from '@digita-ai/nde-erfgoed-core';
import { interpret, Interpreter, StateValueMap } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Login, Search } from '@digita-ai/nde-erfgoed-theme';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { FormCleanlinessStates, FormContext, formMachine, FormRootStates, FormSubmissionStates, FormValidationStates } from '../forms/form.machine';
import { Event } from '../state/event';
import { FormValidatorResult } from '../forms/form-validator-result';
import { FormEvents } from '../forms/form.events';
import { FormValidator } from '../forms/form-validator';

/**
 * Validates the form and returns its results.
 *
 * @param context The form machine state's context.
 * @param event The event which triggered the validation.
 * @returns Results of the validation.
 */
export const validator: FormValidator<Collection> = (context: FormContext<Collection>, event: Event<FormEvents>): FormValidatorResult[] => [
  ...context.data && context.data.name ? [] : [ { field: 'name', message: 'demo-form.name.required' } ],
  ...context.data && context.data.uri ? [] : [ { field: 'uri', message: 'demo-form.uri.required' } ],
];

/**
 * A component which shows the details of a single collection.
 */
export class DemoFormComponent extends RxLitElement {

  /**
   * The component's translator.
   */
  @property({type: Translator})
  public translator: Translator = new MemoryTranslator([
    {
      key: 'demo-form.name.required',
      locale: 'nl-NL',
      value: 'Name is required.',
    },
    {
      key: 'demo-form.uri.required',
      locale: 'nl-NL',
      value: 'URI is required.',
    },
  ], 'nl-NL');

  /**
   * The actor controlling this component.
   */
  @property({type: Object})
  public actor: Interpreter<FormContext<Collection>>;

  /**
   * Enables or disables the submit button.
   */
  @internalProperty()
  enableSubmit = false;

  /**
   * The constructor of the application root component,
   * which starts the root machine actor.
   */
  constructor() {
    super();

    this.actor = interpret(
      formMachine<Collection>(validator).withContext({
        data: { uri: '', name: 'Test' },
        original: { uri: '', name: 'Test' },
      }),
    );

    this.actor.start();
  }

  /**
   * Hook called on first update after connection to the DOM.
   * It subscribes to the actor and pipes state to the properties.
   */
  firstUpdated(changed: PropertyValues) {
    super.firstUpdated(changed);

    if (!this.actor) {
      throw new ArgumentError('Argument this.actor should be set.', this.actor);
    }

    this.subscribe('enableSubmit', from(this.actor).pipe(
      map((state) => state.matches({
        [FormRootStates.CLEANLINESS]: FormCleanlinessStates.DIRTY,
        [FormRootStates.VALIDATION]: FormValidationStates.VALID,
        [FormRootStates.SUBMISSION]: FormSubmissionStates.NOT_SUBMITTED,
      })),
    ));
  }

  /**
   * The styles associated with the component.
   */
  static get styles() {
    return [
      css``,
    ];
  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {
    return html`
    <link href="./styles.css" rel="stylesheet">
    <form>
      <nde-form-element .actor="${this.actor}" .translator="${this.translator}" field="uri">
        <label slot="label" for="example">URI</label>
        <div slot="icon">${ unsafeSVG(Search) }</div>
        <input type="text" slot="input" name="example" placeholder="Foo" />
        <button slot="action">${ unsafeSVG(Login) }</button>
        <div slot="help">This isn't helpful</div>
      </nde-form-element>
      <nde-form-element .actor="${this.actor}" .translator="${this.translator}" field="name">
        <label slot="label" for="example">Name</label>
        <div slot="icon">${ unsafeSVG(Search) }</div>
        <input type="text" slot="input" name="example" placeholder="Foo" />
        <div slot="help">This isn't helpful</div>
      </nde-form-element>

      <button ?disabled="${!this.enableSubmit}" @click="${() => this.actor.send(FormEvents.FORM_SUBMITTED)}">Save changes</button>
    </form>
  `;
  }
}

export default DemoFormComponent;
