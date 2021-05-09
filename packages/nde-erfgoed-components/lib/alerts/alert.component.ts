import { css, html, LitElement, property, unsafeCSS } from 'lit-element';
import { ArgumentError, Logger, Translator } from '@digita-ai/nde-erfgoed-core';
import { Bell, Cross, Theme } from '@digita-ai/nde-erfgoed-theme';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { Alert } from './alert';

/**
 * A component which shows the details of a single alert.
 */
export class AlertComponent extends LitElement {

  /**
   * The component's logger.
   */
  @property({ type: Logger })
  public logger: Logger;

  /**
   * The component's translator.
   */
  @property({ type: Translator })
  public translator: Translator;

  /**
   * The collection which will be rendered by the component.
   */
  @property({ type: Object })
  public alert: Alert;

  /**
   * The styles associated with the component.
   */
  static get styles() {

    return [
      unsafeCSS(Theme),
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
        .alert .dismiss {
          cursor: pointer;
          padding: 0px var(--gap-small);
        }
        .alert .dismiss svg {
          max-height: var(--gap-small);
          max-width: var(--gap-small);
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

    this.dispatchEvent(new CustomEvent<Alert>('dismiss', { detail:this.alert }));

  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {

    const message = this.translator ? this.translator.translate(this.alert?.message) : this.alert?.message;
    const type = this.alert && this.alert.type ? this.alert.type : 'warning';

    return html`
    <div class="alert ${ type }">
      <div class="icon">${ unsafeSVG(Bell) }</div>
      <div class="message">${ message }</div>
      <div class="dismiss" @click="${ this.dismiss }">${ unsafeSVG(Cross) }</div>
    </div>
  `;

  }

}

export default AlertComponent;
