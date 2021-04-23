import { css, html, internalProperty, property, PropertyValues } from 'lit-element';
import { Collection, ConsoleLogger, Logger, LoggerLevel, Translator } from '@digita-ai/nde-erfgoed-core';
import { interpret, State } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { FormContext, formMachine } from '../forms/form.machine';
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
  }));

  /**
   * The state of this component.
   */
  @internalProperty()
  state?: State<FormContext<Collection>>;

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
  }

  /**
   * The styles associated with the component.
   */
  static get styles() {
    return [
      css`
        .form-element {
          display: flex;
          flex-direction: column;
        }
        .form-element .field {
          display: flex;
          flex-direction: row;
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
        <span slot="icon">x</span>
        <input type="text" slot="input" name="example" placeholder="Foo" .value="${this.state?.context?.data?.uri}" @change="${(e: InputEvent) => this.actor.send(FormEvents.UPDATED_ELEMENT, {update: (data: any) => ({...data, uri: e.target.value})})}" />
        <button slot="action" @click="${() => this.actor.send(FormEvents.SELECTED_ELEMENT)}">Go</button>
        <span slot="help">This isn't helpful</span>
      </nde-form-element>
      <nde-form-element>
        <label slot="label" for="example">Name</label>
        <span slot="icon">x</span>
        <input type="text" slot="input" name="example" placeholder="Foo" .value="${this.state?.context?.data?.name}" @change="${(e: InputEvent) => this.actor.send(FormEvents.UPDATED_ELEMENT, {update: (data: any) => ({...data, name: e.target.value})})}" />
        <button slot="action" @click="${() => this.actor.send(FormEvents.SELECTED_ELEMENT)}">Go</button>
        <span slot="help">This isn't helpful</span>
      </nde-form-element>
    </nde-form>
  `;
  }
}

export default DemoFormComponent;
