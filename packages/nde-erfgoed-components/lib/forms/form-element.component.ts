import { css, html, LitElement, property } from 'lit-element';
import { Logger, Translator } from '@digita-ai/nde-erfgoed-core';
import { SpawnedActorRef, State } from 'xstate';
import { Event } from '../state/event';
import { FormEvents } from './form.events';
import { FormContext } from './form.machine';

/**
 * A component which shows the details of a single collection.
 */
export class FormElementComponent extends LitElement {

  /**
   * The component's logger.
   */
  @property({type: Logger})
  public logger: Logger;

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
   * The styles associated with the component.
   */
  static get styles() {
    return [
      css`
        :root {
          display: block;
        }
        .form-element {
          display: flex;
          flex-direction: column;
          align-items: stretch;
        }
        .form-element .content {
          display: flex;
          flex-direction: row;
          align-items: stretch;
        }
        .form-element .content .field {
          display: flex;
          flex-direction: row;
          border: var(--border-normal) solid var(--colors-foreground-normal);
          padding: var(--gap-small) var(--gap-normal);
          height: 20px;
          align-items: center;
          flex: 1 0;
        }
        .form-element .label {
          font-weight: var(--font-weight-bold);
          margin-bottom: var(--gap-small);
        }
        .form-element .content .field .input {
          flex: 1 0;
        }
        .form-element .content .field .icon {
          max-height: var(--gap-normal);
          max-width: var(--gap-normal);
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
    <div class="form-element">
      <div class="label">
        <slot name="label"></slot>
      </div>
      <div class="content">
        <div class="field">
          <div class="input">
            <slot name="input"></slot>
          </div>
          <div class="icon">
            <slot name="icon"></slot>
          </div>
        </div>
        <div class="action">
          <slot name="action"></slot>
        </div>
      </div>
      <div class="help">
        <slot name="help"></slot>
      </div>
    </div>
  `;
  }
}

export default FormElementComponent;
