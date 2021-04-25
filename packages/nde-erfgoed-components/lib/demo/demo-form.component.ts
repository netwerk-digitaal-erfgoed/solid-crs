import { css, html, internalProperty, property, PropertyValues } from 'lit-element';
import { Collection, ConsoleLogger, Logger, LoggerLevel, Translator } from '@digita-ai/nde-erfgoed-core';
import { interpret, Interpreter } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Login, Search } from '@digita-ai/nde-erfgoed-theme';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { FormContext, formMachine, FormStates, FormEvents } from '../forms/form.machine';
import { Event } from '../state/event';
import { FormValidationResult } from 'lib/forms/form-validation-result';

export const validator = (context: FormContext<Collection>, event: Event<FormEvents>): FormValidationResult[] => [
  ...context.data && context.data.name ? [] : [ { field: 'name', message: 'Name is required' } ],
  ...context.data && context.data.uri ? [] : [ { field: 'uri', message: 'URI is required.' } ],
];

/**
 * A component which shows the details of a single collection.
 */
export class DemoFormComponent extends RxLitElement {

  /**
   * The component's logger.
   */
  @property({type: Logger})
  public logger: Logger = new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly);

  /**
   * The component's translator.
   */
  @property({type: Translator})
  public translator: Translator;

  /**
   * The actor controlling this component.
   */
  @property({type: Object})
  public actor: Interpreter<FormContext<Collection>, any, Event<FormEvents>>;

  @internalProperty()
  enableSubmit = false;

  /**
   * The constructor of the application root component,
   * which starts the root machine actor.
   */
  constructor() {
    super();

    this.actor = interpret<FormContext<Collection>, any, Event<FormEvents>>(
      formMachine(validator).withContext({
        data: { uri: '', name: 'Test' },
        original: { uri: '', name: 'Test' },
      }),
    );

    this.actor.start();
  }

  /**
   * Hook called on first update after connection to the DOM.
   * It subscribes to the actor, logs state changes, and pipes state to the properties.
   */
  firstUpdated(changed: PropertyValues) {
    super.firstUpdated(changed);

    this.subscribe('enableSubmit', from(this.actor).pipe(
      map((state) => state.value[FormStates.CLEANLINESS] === FormStates.DIRTY
      && state.value[FormStates.VALIDATION] === FormStates.VALID
      && state.value[FormStates.SUBMISSION] === FormStates.NOT_SUBMITTED),
    ));
  }

  /**
   * The styles associated with the component.
   */
  static get styles() {
    return [
      css`
        
      `,
    ];
  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {
    return html`
    <link href="./dist/bundles/styles.css" rel="stylesheet">
    <nde-form .actor="${this.actor}">
      <nde-form-element .actor="${this.actor}" field="uri">
        <label slot="label" for="example">URI</label>
        <div slot="icon">${ unsafeSVG(Search) }</div>
        <input type="text" slot="input" name="example" placeholder="Foo" />
        <button slot="action">${ unsafeSVG(Login) }</button>
        <div slot="help">This isn't helpful</div>
      </nde-form-element>
      <nde-form-element .actor="${this.actor}" field="name">
        <label slot="label" for="example">Name</label>
        <div slot="icon">${ unsafeSVG(Search) }</div>
        <input type="text" slot="input" name="example" placeholder="Foo" />
        <div slot="help">This isn't helpful</div>
      </nde-form-element>

      <button ?disabled="${!this.enableSubmit}" @click="${() => this.actor.send(FormEvents.FORM_SUBMITTED)}">Save changes</button>
    </nde-form>
  `;
  }
}

export default DemoFormComponent;
