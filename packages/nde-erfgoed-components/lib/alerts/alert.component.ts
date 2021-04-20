import { css, html, LitElement, property } from 'lit-element';
import { Logger, Translator } from '@digita-ai/nde-erfgoed-core';
import { Alert } from './alert';

/**
 * A component which shows the details of a single alert.
 */
export class AlertComponent extends LitElement {

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
   * The collection which will be rendered by the component.
   */
  @property({type: Object})
  private alert: Alert;

  /**
   * The styles associated with the component.
   */
  static get styles() {
    return [
      css`
        .alert {
          padding: var(--gap-normal);
          display: flex;
        }
        .alert.success {
          background-color: var(--colors-status-success);
        }
        .alert.warning {
          background-color: var(--colors-status-warning);
        }
        .alert.danger {
          background-color: var(--colors-status-danger);
        }
        .alert .message {
          flex: 1 0;
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
    <div class="alert ${this.alert?.type}">
      <div class="icon"></div>
      <div class="message">${this.alert?.message}</div>
      <div class="dismiss">x</div>
    </div>
  `;
  }
}

export default AlertComponent;
