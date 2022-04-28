import { html, css, TemplateResult, CSSResult, unsafeCSS, property, state } from 'lit-element';
import { RxLitElement } from 'rx-lit';
import { Theme, Caret, Empty } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { LoanRequest, Logger, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { Interpreter, State } from 'xstate';
import { define } from '@digita-ai/dgt-components';
import { LargeCardComponent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { from } from 'rxjs';
import { LoanContext } from '../loan.context';
import { LoanState, LoanStates, LoanStateSchema } from '../loan.states';
import { ClickedLoanRequestDetailEvent, LoanEvent } from '../loan.events';

export class LoanOverviewComponent extends RxLitElement {

  @property() loanRequests?: LoanRequest[];

  @state() state?: State<LoanContext, LoanEvent, LoanStateSchema, LoanState>;

  constructor(
    private actor: Interpreter<LoanContext, LoanStateSchema, LoanEvent, LoanState>,
    public translator: Translator,
    public logger: Logger,
  ) {

    super();
    define('nde-large-card', LargeCardComponent);

    this.subscribe('state', from(this.actor));

  }

  onLoanRequestClicked(loanRequest: LoanRequest): void {

    this.actor.send(new ClickedLoanRequestDetailEvent(loanRequest));

  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    return html`
      ${ this.loanRequests?.length > 0 ? html`
        ${ this.loanRequests?.map((loanRequest: LoanRequest) => html`
          <nde-large-card .showImage="${false}" .showContent="${false}"
            @click="${ () => this.onLoanRequestClicked(loanRequest) }"
            title="${ this.translator?.translate('loan.overview.card.hover-title')}"
          >
              <div slot="title">${ this.translator?.translate(`loan.overview.card.title-${loanRequest.type.split('#')[1].toLowerCase()}`) }</div>
              <div slot="subtitle">${loanRequest.from}</div>
              <div slot="actions">${unsafeSVG(Caret)}</div>
            </nde-large-card>
        `)}
      ` : html`
        <div class="empty">
          ${unsafeSVG(Empty)}
          <span>
            ${ this.state?.matches(LoanStates.LOAN_REQUEST_OVERVIEW_INCOMING) ? html`
              ${ this.translator?.translate('loan.overview.empty.message-incoming')}
            ` : ''}
            ${ this.state?.matches(LoanStates.LOAN_REQUEST_OVERVIEW_ACCEPTED) ? html`
              ${ this.translator?.translate('loan.overview.empty.message-accepted')}
            ` : ''}
          </span>
        </div>
      `}
    `;

  }

  /**
   * The styles associated with the component.
   */
  static get styles(): CSSResult[] {

    return [
      unsafeCSS(Theme),
      css`
        :host {
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: var(--gap-large);
          height: calc(100% - var(--gap-large));
        }
        nde-large-card:hover {
          cursor: pointer;
        }
        .tooltip {
          background-color: red;
        }
        .empty svg {
          width: 60%;
          height: auto;
        }
        .empty span {
          color: var(--colors-foreground-dark);
          text-align: center;
        }
        .empty {
          display: flex;
          flex-direction: column;
          height: 100%;
          gap: var(--gap-large);
          justify-content: center;
          align-items: center;
        }
      `,
    ];

  }

}
