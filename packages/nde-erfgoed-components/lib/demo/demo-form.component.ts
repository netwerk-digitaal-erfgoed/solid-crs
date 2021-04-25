import { css, html, internalProperty, property, PropertyValues } from 'lit-element';
import { Collection, ConsoleLogger, Logger, LoggerLevel, Translator } from '@digita-ai/nde-erfgoed-core';
import { interpret, State } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Login, Search } from '@digita-ai/nde-erfgoed-theme';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { FormContext, formMachine, FormStates } from '../forms/form.machine';
import { FormEvents } from '../forms/form.events';

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
  public actor = interpret(formMachine.withContext({
    data: { uri: '', name: 'Test' },
    original: { uri: '', name: 'Test' },
  }));

  /**
   * The state of this component.
   */
  @internalProperty()
  state?: State<FormContext<Collection>>;

  @internalProperty()
  enableSubmit = false;

  /**
   * The constructor of the application root component,
   * which starts the root machine actor.
   */
  constructor() {
    super();
    this.actor.start();
  }

  /**
   * Hook called on first update after connection to the DOM.
   * It subscribes to the actor, logs state changes, and pipes state to the properties.
   */
  firstUpdated(changed: PropertyValues) {
    super.firstUpdated(changed);

    this.subscribe('state', from(this.actor).pipe(
      tap((state) => this.logger.debug(DemoFormComponent.name, 'CollectionState change:', state)),
    ));

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
        nde-form {
          display: flex;
          flex-direction: column;
          align-items: stretch;
        }
        nde-form nde-form-element {
          margin-bottom: var(--gap-large);
          display: block;
        }
        nde-form nde-form-element:last-child {
          margin-bottom: 0px;
        }
        nde-form nde-form-element input {
          color: var(--colors-foreground-normal);
          padding: 0px;
          border: none;
          font-size: var(--font-size-small);
          outline: none;
          display: block;
          width: 100%;
        }
        nde-form nde-form-element div[slot="icon"] svg {
          max-height: var(--gap-normal);
          max-width: var(--gap-normal);
        }
        nde-form nde-form-element div[slot="help"] {
          font-size: var(--font-size-small);
          color: var(--colors-foreground-light);
        }
        nde-form nde-form-element button[slot="action"] {
          height: 44px;
        } 
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
      <nde-form-element>
        <label slot="label" for="example">URI</label>
        <div slot="icon">${ unsafeSVG(Search) }</div>
        <input type="text" slot="input" name="example" placeholder="Foo" .value="${this.state?.context?.data?.uri}" @input="${(e: InputEvent) => this.actor.send(FormEvents.UPDATED_ELEMENT, {update: (data: any) => ({...data, uri: e.target.value})})}" />
        <button slot="action" @click="${() => this.actor.send(FormEvents.SELECTED_ELEMENT)}">${ unsafeSVG(Login) }</button>
        <div slot="help">This isn't helpful</div>
      </nde-form-element>
      <nde-form-element>
        <label slot="label" for="example">Name</label>
        <div slot="icon">${ unsafeSVG(Search) }</div>
        <input type="text" slot="input" name="example" placeholder="Foo" .value="${this.state?.context?.data?.name}" @input="${(e: InputEvent) => this.actor.send(FormEvents.UPDATED_ELEMENT, {update: (data: any) => ({...data, name: e.target.value})})}" />
        <button slot="action" @click="${() => this.actor.send(FormEvents.SELECTED_ELEMENT)}">${ unsafeSVG(Login) }</button>
        <div slot="help">This isn't helpful</div>
      </nde-form-element>
    </nde-form>
    
    <button ?disabled="${!this.enableSubmit}" @click="${() => this.actor.send(FormEvents.SUBMITTED)}">Save</button>
    ${this.state?.value[FormStates.CLEANLINESS]}
    ${this.state?.value[FormStates.VALIDATION]}
    ${this.state?.value[FormStates.SUBMISSION]}
    ${this.enableSubmit}
  `;
  }
}

export default DemoFormComponent;
