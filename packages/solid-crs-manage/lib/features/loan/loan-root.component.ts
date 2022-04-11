import { define, hydrate } from '@digita-ai/dgt-components';
import { html, css, TemplateResult, CSSResult, unsafeCSS, state } from 'lit-element';
import { RxLitElement } from 'rx-lit';
import { createMachine, interpret, Interpreter, State, StateMachine } from 'xstate';
import { from, map } from 'rxjs';
import { Theme, Bruikleen } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { Logger, Translator, CollectionStore, LoanRequest, Collection, CollectionObjectStore } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { SolidSDKService } from '@digita-ai/inrupt-solid-service';
import { LoanContext } from './loan.context';
import { LoanState, LoanStates, LoanStateSchema } from './loan.states';
import { ClickedImportCollection, ClickedLoanRequestOverviewAcceptedEvent, ClickedLoanRequestOverviewIncomingEvent, ClickedNewLoanRequestEvent, CollectionImported, LoanEvent, LoanEvents } from './loan.events';
import { loanMachine } from './loan.machine';
import { LoanOverviewComponent } from './components/loan-overview.component';
import { LoanDetailComponent } from './components/loan-detail.component';
import { LoanCreationComponent } from './components/loan-creation.component';

export class LoanRootComponent extends RxLitElement {

  private machine: StateMachine<LoanContext, LoanStateSchema, LoanEvent, LoanState>;
  private actor: Interpreter<LoanContext, LoanStateSchema, LoanEvent, LoanState>;

  @state() state?: State<LoanContext, LoanEvent, LoanStateSchema, LoanState>;
  @state() loanRequest: LoanRequest;
  @state() loanRequests: LoanRequest[];

  constructor(
    public translator: Translator,
    public logger: Logger,
    public solidService: SolidSDKService,
    public collectionStore: CollectionStore,
    public objectStore: CollectionObjectStore,
  ) {

    super();

    this.machine = createMachine<LoanContext, LoanEvent, LoanState>(loanMachine).withContext({
      solidService: this.solidService,
      collectionStore: this.collectionStore,
      objectStore: this.objectStore,
    });

    this.actor = interpret(this.machine, { devTools: true });
    this.subscribe('state', from(this.actor));

    this.subscribe('loanRequest', from(this.actor).pipe(
      map((stateMachine) => stateMachine.context.loanRequest),
    ));

    this.subscribe('loanRequests', from(this.actor).pipe(
      map((stateMachine) => stateMachine.context.loanRequests),
    ));

    this.actor.onEvent((event) => {

      if (event instanceof CollectionImported) {

        this.dispatchEvent(new CustomEvent<Collection>('collection-imported', { detail: event.collection }));

      }

    });

    this.actor.start();

    define('nde-loan-overview-component', hydrate(LoanOverviewComponent)(this.actor, this.translator, this.logger));
    define('nde-loan-detail-component', hydrate(LoanDetailComponent)(this.actor, this.translator, this.logger));
    define('nde-loan-creation-component', hydrate(LoanCreationComponent)(this.actor, this.translator, this.logger));

  }

  onNewLoanRequest(): void {

    this.actor.send(new ClickedNewLoanRequestEvent());

  }

  onLoanRequestOverviewIncoming(): void {

    this.actor.send(new ClickedLoanRequestOverviewIncomingEvent());

  }

  onLoanRequestOverviewAccepted(): void {

    this.actor.send(new ClickedLoanRequestOverviewAcceptedEvent());

  }

  onImportCollection = (event: CustomEvent<Collection>): void =>  {

    this.actor.send(new ClickedImportCollection(event.detail));

  };

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    const loanRequestType = this.loanRequest?.type?.split('#')[1].toLowerCase();

    return html`
      <nde-content-header inverse>
        <div slot="icon"> ${unsafeSVG(Bruikleen)} </div>
        <div slot="title">
          ${this.state?.matches(LoanStates.LOAN_REQUEST_DETAIL)
    ? this.translator?.translate(`loan.detail.header.title-${loanRequestType}`)
    : this.translator?.translate('loan.root.header.title-default')}
        </div>
        <div slot="subtitle">
          ${this.state.matches(LoanStates.LOAN_REQUEST_OVERVIEW_INCOMING)
    ? this.translator?.translate('loan.overview.header.subtitle') : ''}
        ${this.state.matches(LoanStates.LOAN_REQUEST_OVERVIEW_ACCEPTED)
    ? this.translator?.translate('loan.overview.header.subtitle-accepted') : ''}
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
              <nde-sidebar-list-item slot="item"
                ?selected="${this.state?.matches(LoanStates.LOAN_REQUEST_OVERVIEW_ACCEPTED)
                  || (loanRequestType === 'accept' && this.state?.matches(LoanStates.LOAN_REQUEST_DETAIL))}"
                @click="${this.onLoanRequestOverviewAccepted}"
              >
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
                ?selected="${this.state.matches(LoanStates.LOAN_REQUEST_OVERVIEW_INCOMING)
                  || (loanRequestType === 'offer' && this.state.matches(LoanStates.LOAN_REQUEST_DETAIL))}"
                @click="${this.onLoanRequestOverviewIncoming}"  
              >
                <div slot="title">${this.translator?.translate('loan.root.sidebar.all-incoming-requests')}</div>
              </nde-sidebar-list-item>
            </nde-sidebar-list>
          </nde-sidebar-item>
        </nde-sidebar>

        <div id="content">
          ${this.state.matches(LoanStates.LOAN_REQUEST_OVERVIEW_INCOMING) ? html`
            <nde-loan-overview-component .loanRequests="${this.loanRequests?.filter((req) => req.type === 'https://www.w3.org/ns/activitystreams#Offer')}"></nde-loan-overview-component>
          ` : ''}
          ${this.state.matches(LoanStates.LOAN_REQUEST_OVERVIEW_ACCEPTED) ? html`
            <nde-loan-overview-component .loanRequests="${this.loanRequests?.filter((req) => req.type === 'https://www.w3.org/ns/activitystreams#Accept')}"></nde-loan-overview-component>
          ` : ''}
          ${this.state.matches(LoanStates.LOAN_REQUEST_DETAIL) ? html`<nde-loan-detail-component @import-collection="${this.onImportCollection}"></nde-loan-detail-component>` : ''}
          ${this.state.matches(LoanStates.LOAN_REQUEST_CREATION) ? html`<nde-loan-creation-component></nde-loan-creation-component>` : ''}
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
