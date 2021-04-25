import { css, html, internalProperty, property } from 'lit-element';
import { ConsoleLogger, Logger, LoggerLevel, Translator } from '@digita-ai/nde-erfgoed-core';
import { SpawnedActorRef, State } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { Event } from '../state/event';
import { FormContext, FormEvents } from './form.machine';

/**
 * A component which shows the details of a single collection.
 */
export class FormComponent extends RxLitElement {

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
  public actor: SpawnedActorRef<Event<FormEvents>, State<FormContext<any>>>;

  /**
   * The state of this component.
   */
  @internalProperty()
  state?: State<FormContext<any>>;

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
    <div class="form">
      <form>
        <slot></slot>
      </form>
    </div>
  `;
  }
}

export default FormComponent;
