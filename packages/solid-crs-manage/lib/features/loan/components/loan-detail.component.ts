import { html, css, TemplateResult, CSSResult, unsafeCSS, state } from 'lit-element';
import { RxLitElement } from 'rx-lit';
import { Theme, Collection as CollectionSvg } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { LoanRequest, Logger, Translator, Collection } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { FormElementComponent, LargeCardComponent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { from, map } from 'rxjs';
import { define } from '@digita-ai/dgt-components';
import { Interpreter } from 'xstate';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { LoanContext } from '../loan.context';
import { LoanState, LoanStateSchema } from '../loan.states';
import { ClickedAcceptedLoanRequestEvent, ClickedLoanRequestOverviewEvent, ClickedRejectedLoanRequestEvent, LoanEvent } from '../loan.events';

export class LoanDetailComponent extends RxLitElement {

  @state() loanRequest?: LoanRequest;
  @state() collection?: Collection;

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

    this.subscribe('collection', from(this.actor).pipe(
      map((machineState) => machineState.context.collection),
    ));

  }

  onRejectLoanRequest = (): void => {

    if (this.loanRequest) { this.actor.send(new ClickedRejectedLoanRequestEvent(this.loanRequest)); }

  };

  onAcceptLoanRequest = (): void =>  {

    if (this.loanRequest) { this.actor.send(new ClickedAcceptedLoanRequestEvent(this.loanRequest)); }

  };

  onImportCollection = (): void =>  {

    if (this.loanRequest?.type === 'https://www.w3.org/ns/activitystreams#Accept' && this.collection) {

      this.dispatchEvent(new CustomEvent<Collection>('import-collection', { detail: this.collection }));

    }

  };

  onCancelImport = (): void =>  {

    this.actor.send(new ClickedLoanRequestOverviewEvent());

  };

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    const loanRequestType = this.loanRequest.type.split('#')[1].toLowerCase();

    return html`
      <nde-large-card .showImage="${false}" .showHeader="${false}">
        <div slot="content">
          <p>
            ${ this.translator?.translate(`loan.detail.card.title-${loanRequestType}`)
    .replace('{{institution}}', this.loanRequest?.from)}
          </p>
          
          <div id="collection-container">
            <div>${unsafeSVG(CollectionSvg)}</div>
            <a href="${process.env.VITE_PRESENTATION_URI}${encodeURIComponent(this.collection.publisher)}/collection/${encodeURIComponent(this.collection.uri)}" target="_blank" rel="noopener noreferrer">${this.collection?.name}</a>
          </div>

          <nde-form-element .showLabel="${true}" .showValidation="${false}" field="description">
            <label slot="label">
              ${this.translator?.translate('loan.detail.card.description')}
            </label>
            <textarea slot="input" readonly>${this.loanRequest?.description ?? ''}</textarea>
          </nde-form-element>

          ${ this.loanRequest.type === 'https://www.w3.org/ns/activitystreams#Accept'? html`
          <div id="button-container">
            <button class="gray" @click="${this.onCancelImport}">
              ${this.translator?.translate('loan.detail.card.cancel')}
            </button>
            <button class="primary" @click="${this.onImportCollection}">
              ${this.translator?.translate('loan.detail.card.import')}
            </button>
          </div>
          ` : html`
          <div id="button-container">
            <button class="gray" @click="${this.onRejectLoanRequest}">
              ${this.translator?.translate('loan.detail.card.reject')}
            </button>
            <button class="primary" @click="${this.onAcceptLoanRequest}">
              ${this.translator?.translate('loan.detail.card.accept')}
            </button>
          </div>
          `}

          
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
        #collection-container {
          display: flex;
          gap: var(--gap-normal);
          align-items: center;
          justify-content: start;
          padding: var(--gap-small) var(--gap-normal);
        }
        #collection-container a {
          color: var(--colors-primary-light);
        }
        #collection-container svg {
          fill: var(--colors-primary-dark);
        }
        p {
          margin: 0;
        }
      `,
    ];

  }

}
