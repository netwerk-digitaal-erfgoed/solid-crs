import { html, css, TemplateResult, CSSResult, unsafeCSS, state } from 'lit-element';
import { RxLitElement } from 'rx-lit';
import { Theme, Caret } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { LoanRequest, Logger, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { Interpreter } from 'xstate';
import { from, map } from 'rxjs';
import { define } from '@digita-ai/dgt-components';
import { LargeCardComponent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { LoanContext } from '../loan.context';
import { LoanState, LoanStateSchema } from '../loan.states';
import { ClickedLoanRequestDetailEvent, LoanEvent } from '../loan.events';

export class LoanOverviewComponent extends RxLitElement {

  @state() loanRequests?: LoanRequest[];

  constructor(
    private actor: Interpreter<LoanContext, LoanStateSchema, LoanEvent, LoanState>,
    public translator: Translator,
    public logger: Logger,
  ) {

    super();
    define('nde-large-card', LargeCardComponent);

    this.subscribe('loanRequests', from(this.actor).pipe(
      map((machineState) => machineState.context.loanRequests),
    ));

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
        }
        nde-large-card:hover {
          cursor: pointer;
        }
        .tooltip {
          background-color: red;
        }
      `,
    ];

  }

}
