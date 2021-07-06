import { CheckboxChecked, CheckboxUnchecked, Dropdown, Search, Theme } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { html, unsafeCSS, css, TemplateResult, CSSResult, property, query, internalProperty, PropertyValues, queryAll } from 'lit-element';
import { RxLitElement } from 'rx-lit';
import { Interpreter } from 'xstate';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { FormActors, FormContext, FormEvents } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { Term, TermSource, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { map } from 'rxjs/operators';
import { from } from 'rxjs';
import { ClickedSubmitEvent, ClickedTermEvent, QueryUpdatedEvent } from './term.events';
import { TermContext, TermStates } from './term.machine';

/**
 * The root page of the object feature.
 */
export class TermSearchComponent extends RxLitElement {

  /**
   * The actor controlling this component.
   */
  @property({ type: Object })
  public actor: Interpreter<TermContext>;

  /**
   * The component's translator.
   */
  @property({ type: Object })
  public translator: Translator;

  /**
   * The actor responsible for form validation in this component.
   */
  @internalProperty()
  public formActor: Interpreter<FormContext<{ query: string; sources: TermSource[] }>>;

  /**
   * The field that for which Terms are being edited
   */
  @internalProperty()
  field: string;

  /**
   * A list of all sources
   */
  @internalProperty()
  sources: TermSource[];

  /**
   * A list of Term search results
   */
  @internalProperty()
  searchResults: Term[];

  /**
   * A list of selected Term search results
   */
  @internalProperty()
  selectedTerms: Term[];

  /**
   * A the user's query input
   */
  @internalProperty()
  query: string;

  /**
   * The user's selected sources
   */
  @queryAll('nde-form-element ul li input[type="checkbox"]')
  sourceCheckboxes: NodeList;
  /**
   * The user's selected sources
   */
  @query('nde-form-element ul li:first-of-type label')
  sourcesLabel: HTMLLabelElement;

  /**
   * The input element of the search form
   */
  @query('nde-form-element.term input')
  public searchInput: HTMLInputElement;

  /**
   * Hook called on every update after connection to the DOM.
   */
  updated(changed: PropertyValues): void {

    super.updated(changed);

    if(changed.has('actor') && this.actor) {

      this.subscribe('field', from(this.actor).pipe(
        map((state) => state.context?.field),
      ));

      this.subscribe('sources', from(this.actor).pipe(
        map((state) => state.context?.sources),
      ));

      this.subscribe('searchResults', from(this.actor).pipe(
        map((state) => state.context?.searchResults),
      ));

      this.subscribe('selectedTerms', from(this.actor).pipe(
        map((state) => state.context?.selectedTerms),
      ));

      this.subscribe('formActor', from(this.actor).pipe(
        map((state) => (state.children[FormActors.FORM_MACHINE] as Interpreter<FormContext<{
          query: string; sources: TermSource[]; }>>)),
      ));

    }

  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    if (this.formActor) {

      this.formActor.onEvent((event) => {

        if (event.type === FormEvents.FORM_VALIDATED) {

          const selectedSources = Array.from(this.sourceCheckboxes)
            .filter((checkbox: HTMLInputElement) => checkbox.checked)
            .map((checkbox: HTMLInputElement) => checkbox.id);

          this.actor.send(new QueryUpdatedEvent(this.searchInput?.value, selectedSources));

        }

      });

    }

    const loading = !this.actor.state.matches(TermStates.IDLE);

    return this.sources ? html`

      ${ loading || this.sources?.length < 1 ? html`<nde-progress-bar></nde-progress-bar>` : html`` }

      <form class="search-form" onsubmit="return false">
          <nde-form-element
            class="term" .actor="${this.formActor}" field="query" .submitOnEnter="${false}">
            <label slot="label" for="example">${ this.translator.translate(`nde.features.object.card.field.${this.field}`) }</label>
            <input 
              type="text"
              slot="input"
              name="${this.field}"
              class="query"
            />
            <div slot="icon">${ unsafeSVG(Search) }</div>
          </nde-form-element>

          <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="sources">
            <div slot="icon">${ unsafeSVG(Dropdown) }</div>
            <ul slot="input" >
              <li>
                <label for="title">${this.translator.translate('nde.features.term.click-to-select')}</label>
              </li>
              ${ this.sources.map((source) => html`
                <li>
                  <input
                    type="checkbox"
                    id="${source.uri}"
                    name="${source.uri}"
                  />
                  <label for="${source.uri}">${source.name}</label>
                </li>
              `)}
            </ul>
          </nde-form-element>

          <button type="button" @click="${() => this.actor.send(new ClickedSubmitEvent())}">Bevestig</button>
        </form> 

        <!-- show selected terms -->
        ${this.selectedTerms?.length > 0 ? html`
        <div class="term-list">
          <p class="title">
            ${this.selectedTerms.length} ${ this.translator.translate(this.selectedTerms.length === 1 ? 'nde.features.term.term-selected' : 'nde.features.term.terms-selected').toLowerCase()}
          </p>
          ${ this.selectedTerms?.map((term) => html`
            <nde-large-card
            class="term-card"
            .showImage="${false}"
            ?showContent="${term.description.length || term.alternateName.length || term.broader.length || term.narrower.length}"
            @click=${() => this.actor.send(new ClickedTermEvent(term))}>
              <div slot="title">${ term.name }</div>
              <div slot="subtitle">${ term.uri }</div>
              <div slot="icon">
                ${unsafeSVG(CheckboxChecked)}
              </div>
              <div slot="content">
                ${ term.description.length > 0 ? html`<p>Beschrijving: ${ term.description }</p>` : html``}
                ${ term.alternateName.length > 0 ? html`<p>Alternatief: ${ term.alternateName.join(', ') }</p>` : html``}
                ${ term.broader.length > 0 ? html`<p>Broader: ${ term.broader.map((broader) => broader.name).join(', ') }</p>` : html``}
                ${ term.narrower.length > 0 ? html`<p>Narrower: ${ term.narrower.map((narrower) => narrower.name).join(', ') }</p>` : html``}
                ${ term.hiddenName.length > 0 ? html`<p>Verborgen naam: ${ term.hiddenName  }</p>` : html``}
              </div>
            </nde-large-card>`)}
        </div>` : html``}

        <!-- show search results -->
        ${this.searchResults?.length > 0 ? html`
        <div class="term-list">
          <p class="title">
            ${this.searchResults.length} ${ this.translator.translate(this.searchResults.length === 1 ? 'nde.features.term.search-result' : 'nde.features.term.search-results').toLowerCase()}
          </p>
          ${ this.searchResults?.map((term) => html`
            <nde-large-card
            class="term-card"
            .showImage="${false}"
            ?showContent="${term.description.length || term.alternateName.length || term.broader.length || term.narrower.length}"
            @click=${() => this.actor.send(new ClickedTermEvent(term))}>
              <div slot="title">${ term.name }</div>
              <div slot="subtitle">${ term.uri }</div>
              <div slot="icon">
                ${ this.selectedTerms?.includes(term) ? unsafeSVG(CheckboxChecked) : unsafeSVG(CheckboxUnchecked)}
              </div>
              <div slot="content">
                ${ term.description.length > 0 ? html`<p>Beschrijving: ${ term.description }</p>` : html``}
                ${ term.alternateName.length > 0 ? html`<p>Alternatief: ${ term.alternateName.join(', ') }</p>` : html``}
                ${ term.broader.length > 0 ? html`<p>Broader: ${ term.broader.map((broader) => broader.name).join(', ') }</p>` : html``}
                ${ term.narrower.length > 0 ? html`<p>Narrower: ${ term.narrower.map((narrower) => narrower.name).join(', ') }</p>` : html``}
                ${ term.hiddenName.length > 0 ? html`<p>Verborgen naam: ${ term.hiddenName  }</p>` : html``}
              </div>
            </nde-large-card>`)}
        </div>` : html``}

        ${this.searchResults?.length < 1 && this.selectedTerms?.length < 1 ? html`geen zoekresultaten` : html``}


      ` : html``;

  }

  static get styles(): CSSResult[] {

    return [
      unsafeCSS(Theme),
      css`
        *::-webkit-scrollbar-thumb {
          background-color: var(--colors-foreground-light);
          border: 3px solid var(--colors-background-normal);
        }
        *::-webkit-scrollbar-track {
          background: var(--colors-background-normal);
        }
        :host {
          scrollbar-color: var(--colors-foreground-light) var(--colors-background-normal);
          padding: var(--gap-large);
          width: 100%;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        :host > * {
          margin-bottom: var(--gap-large);
        }
        nde-progress-bar {
          position: absolute;
          width: 100%;
          top: 0;
          left: 0;
        }
        .search-form {
          display: flex;
          flex-direction: row;
          align-items: flex-end;
          justify-content: space-between;
          gap: var(--gap-large);
        }
        .search-form nde-form-element {
          flex-grow: 2;
          min-width: 250px;
        }
        .search-form button {
          flex-grow: 1;
          min-width: 106px;
          height: 46px;
          background-color: var(--colors-primary-light);
        }
        .title {
          margin: 0;
          font-weight: bold;
          text-align: center;
        }
        .term-list {
          display: flex;
          flex-direction: column;
          gap: var(--gap-large);
        }
        .term-card {
          cursor: pointer;
        }
        .term-card p {
          font-size: var(--font-size-small);
          word-break: break-word;
        }
        nde-form-element {
          margin: 0;
        }
      `,
    ];

  }

}

export default TermSearchComponent;
