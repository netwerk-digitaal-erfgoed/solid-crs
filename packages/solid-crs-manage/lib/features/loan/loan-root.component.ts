import { define, hydrate } from '@digita-ai/dgt-components';
import { html, css, TemplateResult, CSSResult, unsafeCSS, state } from 'lit-element';
import { RxLitElement } from 'rx-lit';
import { createMachine, interpret, Interpreter, State, StateMachine } from 'xstate';
import { from, map } from 'rxjs';
import { Theme, Bruikleen } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { LoanRequest, Logger, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { LoanContext } from './loan.context';
import { LoanState, LoanStates, LoanStateSchema } from './loan.states';
import { ClickedLoanRequestOverviewEvent, ClickedNewLoanRequestEvent, LoanEvent } from './loan.events';
import { loanMachine } from './loan.machine';
import { LoanOverviewComponent } from './components/loan-overview.component';
import { LoanDetailComponent } from './components/loan-detail.component';
import { LoanCreationComponent } from './components/loan-creation.component';

export class LoanRootComponent extends RxLitElement {

  private machine: StateMachine<LoanContext, LoanStateSchema, LoanEvent, LoanState>;
  private actor: Interpreter<LoanContext, LoanStateSchema, LoanEvent, LoanState>;

  @state() state?: State<LoanContext, LoanEvent, LoanStateSchema, LoanState>;
  @state() loanRequest: LoanRequest;

  constructor(
    public translator: Translator,
    public logger: Logger,
  ) {

    super();

    this.machine = createMachine<LoanContext, LoanEvent, LoanState>(loanMachine).withContext({});
    this.actor = interpret(this.machine, { devTools: true });
    this.subscribe('state', from(this.actor));

    this.subscribe('loanRequest', from(this.actor).pipe(
      map((stateMachine) => stateMachine.context.loanRequest),
    ));

    this.actor.start();

    define('nde-loan-overview-component', hydrate(LoanOverviewComponent)(this.actor, this.translator, this.logger));
    define('nde-loan-detail-component', hydrate(LoanDetailComponent)(this.actor, this.translator, this.logger));
    define('nde-loan-creation-component', hydrate(LoanCreationComponent)(this.actor, this.translator, this.logger));

  }

  onNewLoanRequest(): void {

    this.actor.send(new ClickedNewLoanRequestEvent());

  }

  onLoanRequestOverview(): void {

    this.actor.send(new ClickedLoanRequestOverviewEvent());

  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    return html`
      <nde-content-header inverse>
        <div slot="icon"> ${unsafeSVG(Bruikleen)} </div>
        <div slot="title">
          ${this.state?.matches(LoanStates.LOAN_REQUEST_DETAIL)
    ? this.translator?.translate('loan.detail.header.title')
    : this.translator?.translate('loan.root.header.title-default')}
        </div>
        <div slot="subtitle">
          ${this.state.matches(LoanStates.LOAN_REQUEST_OVERVIEW)
    ? this.translator?.translate('loan.overview.header.subtitle') : ''}
          ${this.state.matches(LoanStates.LOAN_REQUEST_CREATION)
    ? this.translator?.translate('loan.creation.header.subtitle') : ''}
          ${this.state.matches(LoanStates.LOAN_REQUEST_DETAIL)
    ? this.translator?.translate('loan.detail.header.subtitle')
      .replace('{{institution}}', this.loanRequest?.from) : ''}
        </div>
      </nde-content-header>
      <div id="page">
        
        <nde-sidebar>
          <nde-sidebar-item .padding="${false}">
            <nde-sidebar-list slot="content">
              <nde-sidebar-list-item slot="title" isTitle>
                <div slot="title">${this.translator?.translate('loan.root.sidebar.send-request')}</div>
              </nde-sidebar-list-item>
              <nde-sidebar-list-item slot="item" 
                ?selected="${this.state.matches(LoanStates.LOAN_REQUEST_CREATION)}"
                @click="${this.onNewLoanRequest}"  
              >
                <div slot="title">${this.translator?.translate('loan.root.sidebar.new-request')}</div>
              </nde-sidebar-list-item>
              <nde-sidebar-list-item slot="item">
                <div slot="title">${this.translator?.translate('loan.root.sidebar.pending-requests')}</div>
              </nde-sidebar-list-item>
              <nde-sidebar-list-item slot="item">
                <div slot="title">${this.translator?.translate('loan.root.sidebar.approved-requests')}</div>
              </nde-sidebar-list-item>
            </nde-sidebar-list>
          </nde-sidebar-item>
          <nde-sidebar-item .padding="${false}" .showBorder="${false}">
            <nde-sidebar-list slot="content">
              <nde-sidebar-list-item slot="title" isTitle>
                <div slot="title">${this.translator?.translate('loan.root.sidebar.incoming-requests')}</div>
              </nde-sidebar-list-item>
              <nde-sidebar-list-item slot="item"
                ?selected="${this.state.matches(LoanStates.LOAN_REQUEST_OVERVIEW) || this.state.matches(LoanStates.LOAN_REQUEST_DETAIL)}"
                @click="${this.onLoanRequestOverview}"  
              >
                <div slot="title">${this.translator?.translate('loan.root.sidebar.all-incoming-requests')}</div>
              </nde-sidebar-list-item>
            </nde-sidebar-list>
          </nde-sidebar-item>
        </nde-sidebar>

        <div id="content">
          ${this.state.matches(LoanStates.LOAN_REQUEST_OVERVIEW) ? html`<nde-loan-overview-component></nde-loan-overview-component>` : ''}
          ${this.state.matches(LoanStates.LOAN_REQUEST_CREATION) ? html`<nde-loan-creation-component></nde-loan-creation-component>` : ''}
          ${this.state.matches(LoanStates.LOAN_REQUEST_DETAIL) ? html`<nde-loan-detail-component></nde-loan-detail-component>` : ''}
        </div>
      </div>
    `;

  }

  /**
   * The styles associated with the component.
   */
  static get styles(): CSSResult[] {

    return [
      unsafeCSS(Theme),
      css`
        :host{
          display: flex;
          flex-direction: column;
        }

        nde-content-header {
          flex: 0 0;
          z-index: 2;
        }

        #page {
          display: flex;
          flex-direction: row;
          flex: 1 0;
          overflow: auto;
        }

        #content {
          flex: 1 0;
          padding: var(--gap-large) var(--gap-large) 0;
          overflow: auto;
        }
        #content > * {
          padding-bottom: var(--gap-large);
        }
      `,
    ];

  }

}
