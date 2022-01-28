import { html, css, TemplateResult, CSSResult, unsafeCSS, state } from 'lit-element';
import { RxLitElement } from 'rx-lit';
import { Theme } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { LoanRequest, Logger, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { FormElementComponent, LargeCardComponent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { from, map } from 'rxjs';
import { define } from '@digita-ai/dgt-components';
import { Interpreter } from 'xstate';
import { LoanContext } from '../loan.context';
import { LoanState, LoanStateSchema } from '../loan.states';
import { ClickedAcceptedLoanRequestEvent, ClickedRejectedLoanRequestEvent, LoanEvent } from '../loan.events';

export class LoanDetailComponent extends RxLitElement {

  @state() loanRequest?: LoanRequest;

  constructor(
    private actor: Interpreter<LoanContext, LoanStateSchema, LoanEvent, LoanState>,
    public translator: Translator,
    public logger: Logger,
  ) {

    super();
    define('nde-large-card', LargeCardComponent);
    define('nde-form-element', FormElementComponent);

    this.subscribe('loanRequest', from(this.actor).pipe(
      map((machineState) => machineState.context.loanRequest),
    ));

  }

  onRejectLoanRequest(): void {

    if (this.loanRequest) this.actor.send(new ClickedRejectedLoanRequestEvent(this.loanRequest));

  }

  onAcceptLoanRequest(): void {

    if (this.loanRequest) this.actor.send(new ClickedAcceptedLoanRequestEvent(this.loanRequest));

  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    return html`
      <nde-large-card .showImage="${false}">
        <div slot="title">
          ${ this.translator?.translate('loan.detail.card.title')
    .replace('{{institution}}', this.loanRequest?.from)}
        </div>
        <div slot="content">
          <!-- TODO what needs to be displayed about the collection, and how ? -->
          <p>Small overview of the collection? TODO</p>

          <nde-form-element .showLabel="${true}" .showValidation="${false}" field="description">
            <label slot="label">
              ${this.translator?.translate('loan.detail.card.description')}
            </label>
            <textarea slot="input" readonly>${this.loanRequest?.description ?? ''}</textarea>
          </nde-form-element>

          <div id="button-container">
            <button class="gray" @click="${() => this.onRejectLoanRequest()}">
              ${this.translator?.translate('loan.detail.card.reject')}
            </button>
            <button class="primary" @click="${() => this.onAcceptLoanRequest()}">
              ${this.translator?.translate('loan.detail.card.accept')}
            </button>
          </div>
        </div>
      </nde-large-card>
    `;

  }

  /**
   * The styles associated with the component.
   */
  static get styles(): CSSResult[] {

    return [
      unsafeCSS(Theme),
      css`
        div[slot="content"] {
          display: flex;
          flex-direction: column;
          gap: var(--gap-large);
        }
        #button-container {
          width: 100%;
          display: flex;
          gap: var(--gap-normal);
        }
        #button-container > button {
          flex: 1 0;
        }
      `,
    ];

  }

}
