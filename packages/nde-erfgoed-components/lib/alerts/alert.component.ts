import { css, html, LitElement, property, svg } from 'lit-element';
import { ArgumentError, Logger, Translator } from '@digita-ai/nde-erfgoed-core';
// import Bell from '@digita-ai/nde-erfgoed-theme/dist/icons/Bell';
import {Bell, Dismiss} from '@digita-ai/nde-erfgoed-theme';
import {unsafeSVG} from 'lit-html/directives/unsafe-svg';
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
          padding: var(--gap-normal) var(--gap-small);
          display: flex;
          align-items: center;
        }
        .alert div {
          margin: 0 var(--gap-small);
        }
        .alert.success {
          background-color: var(--colors-status-success);
        }
        .alert.warning {
          background-color: var(--colors-status-warning);
        }
        .alert.danger {
          background-color: var(--colors-status-danger);
          color: var(--colors-foreground-inverse);
        }
        .alert.danger svg {
          fill: var(--colors-foreground-inverse);
        }
        .alert .icon {
          height: 25px;
        }
        .alert .icon svg {
          max-height: 25px;
          max-width: 25px;
        }
        .alert .dismiss svg {
          max-height: 10px;
          max-width: 10px;
        }
        .alert .message {
          flex: 1 0;
        }
      `,
    ];
  }

  /**
   * Dispatches an event to dismiss the alert.
   */
  dismiss() {
    this.logger?.debug(AlertComponent.name, 'Dismissing alert', this.alert);
    if (!this.alert) {
      throw new ArgumentError('Argument this.alert should be set.', this.alert);
    }
    this.dispatchEvent(new CustomEvent<Alert>('dismiss', {detail:this.alert}));
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
      <div class="icon">${unsafeSVG(Bell)}</div>
      <div class="message">${this.translator?this.translator.translate(this.alert?.message):this.alert?.message}</div>
      <div class="dismiss" @click="${this.dismiss}">${unsafeSVG(Dismiss)}</div>
    </div>
  `;
  }
}

export default AlertComponent;
