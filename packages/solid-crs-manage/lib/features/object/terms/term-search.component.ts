import { CheckboxChecked, CheckboxUnchecked, Dropdown, Empty, Plus, Search, Theme } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { html, unsafeCSS, css, TemplateResult, CSSResult, property, query, internalProperty, PropertyValues, queryAll } from 'lit-element';
import { RxLitElement } from 'rx-lit';
import { interpret, Interpreter } from 'xstate';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { Alert, FormActors, FormContext, FormEvents, formMachine, FormSubmittedEvent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { ArgumentError, Logger, Term, TermSource, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { map } from 'rxjs/operators';
import { from } from 'rxjs';
import { v4 } from 'uuid';
import { AppEvents } from '../../../app.events';
import { ClickedCancelTermEvent } from '../object.events';
import { ClickedAddEvent, ClickedSubmitEvent, ClickedTermEvent, QueryUpdatedEvent } from './term.events';
import { TermContext, TermStates } from './term.machine';

/**
 * The root page of the object feature.
 */
export class TermSearchComponent extends RxLitElement {

  /**
   * The component's logger.
   */
  @property({ type: Object })
  public logger: Logger;

  /**
   * The actor controlling this component.
   */
  @property({ type: Object })
  public actor: Interpreter<TermContext>;

  /**
   * The component's alerts.
   */
  @property({ type: Array })
  public alerts: Alert[];

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
   * The form machine used by the form actor
   */
  @internalProperty()
  formMachineLocalTerm = formMachine<Term>();

  /**
   * The actor responsible for form validation in this component.
   */
  @internalProperty()
  formActorLocalTerm = interpret(this.formMachineLocalTerm, { devTools: true });

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
   * A map of Term search results
   */
  @internalProperty()
  searchResultsMap: { [key: string]: Term[] };

  /**
   * A list of selected Term search results
   */
  @internalProperty()
  selectedTerms: Term[];

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

  @query('nde-form-element input')
  public localTermInput: HTMLInputElement;

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

      this.subscribe('searchResultsMap', from(this.actor).pipe(
        map((state) => this.groupSearchResults(state.context?.searchResults)),
      ));

      this.subscribe('selectedTerms', from(this.actor).pipe(
        map((state) => state.context?.selectedTerms),
      ));

      this.subscribe('formActor', from(this.actor).pipe(
        map((state) => (state.children[FormActors.FORM_MACHINE] as Interpreter<FormContext<{
          query: string; sources: TermSource[]; }>>)),
      ));

      if(this.actor.parent){

        this.subscribe('alerts', from(this.actor.parent.parent)
          .pipe(map((state) => state.context?.alerts)));

      }

    }

  }

  groupSearchResults(searchResults: Term[]): { [key: string]: Term[] } {

    return searchResults.length > 0 ? searchResults?.reduce<{ [key: string]: Term[] }>((searchResultsMap, term) => {

      const key = 'source';
      (searchResultsMap[term[key]] = searchResultsMap[term[key]] || []).push(term);

      return searchResultsMap;

    }, {}) : {};

  }

  /**
   * Handles a dismiss event by sending a dismiss alert event to its parent.
   *
   * @param event Dismiss event dispatched by an alert componet.
   */
  handleDismiss(event: CustomEvent<Alert>): void {

    if (!event || !event.detail) {

      throw new ArgumentError('Argument event || event.detail should be set.', event);

    }

    if (!this.actor || !this.actor.parent) {

      throw new ArgumentError('Argument this.actor || !this.actor.parent should be set.', this.actor);

    }

    this.actor.parent.parent.send(AppEvents.DISMISS_ALERT, { alert: event.detail });

  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    // Create an alert components for each alert.
    const alerts = this.alerts?.map((alert) => html`<nde-alert .logger='${this.logger}' .translator='${this.translator}' .alert='${alert}' @dismiss="${this.handleDismiss}"></nde-alert>`);

    this.formActor?.onEvent((event) => {

      if (event.type === FormEvents.FORM_VALIDATED) {

        const selectedSources = Array.from(this.sourceCheckboxes)
          .filter((checkbox: HTMLInputElement) => checkbox.checked)
          .map((checkbox: HTMLInputElement) => checkbox.id);

        this.actor.send(new QueryUpdatedEvent(this.searchInput?.value, selectedSources));

      }

    });

    this.actor?.onEvent((event) => {

      if (event instanceof ClickedAddEvent){

        const uri = `#${v4()}`;

        this.formMachineLocalTerm = formMachine<Term>().withContext({
          data: {
            name: '',
            uri,
          },
          original: {
            name: '',
            uri,
          },
        });

        this.formActorLocalTerm = interpret(this.formMachineLocalTerm, { devTools: true });
        this.formActorLocalTerm.onDone((context) => this.actor.send(new ClickedTermEvent(context.data.data)));
        this.formActorLocalTerm.start();

      }

    });

    const loading = !this.actor?.state.matches(TermStates.IDLE);

    return html`

      ${ (loading || !this.sources) && !alerts ? html`<nde-progress-bar></nde-progress-bar>` : '' }

      ${ alerts }

      <form class="search-form" onsubmit="return false">
        <div class="inputs">
          <nde-form-element
            class="term" .actor="${this.formActor}" field="query" .submitOnEnter="${false}">
            <label slot="label" for="example">${ this.translator.translate(`term.field.${this.field}`) }</label>
            <input 
              type="text"
              slot="input"
              name="${this.field}"
              class="query"
            />
            <div slot="icon">${ unsafeSVG(Search) }</div>
          </nde-form-element>

          <nde-form-element class="sources" .actor="${this.formActor}" .translator="${this.translator}" field="sources" .showLabel="${false}">
            <div slot="icon">${ unsafeSVG(Dropdown) }</div>
            <ul slot="input" type="multiselect" class="multiselect">
              <li>
                <label for="title">${this.translator.translate('common.form.click-to-select')}</label>
              </li>
              ${ this.sources?.map((source) => html`
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
        </div>
        <div class="buttons">
          <button type="button" class="confirm primary" @click="${() => this.actor.send(new ClickedSubmitEvent())}">${this.translator.translate('term.search.confirm')}</button>
          <button type="button" class="cancel gray" @click="${() => this.actor.parent.send(new ClickedCancelTermEvent())}">${this.translator.translate('term.search.cancel')}</button>
        </div>
      </form> 
      
      <a id="create-term" @click="${() => this.actor.send(new ClickedAddEvent())}">${this.translator.translate('term.add-local-term')}</a>

      <!-- show local term input -->
      ${ this.actor?.state?.matches(TermStates.CREATING) ? html `
      <nde-large-card
        id="create-term-card"
        class="term-card"
        .showImage="${false}"
        .showContent="${false}"
      >
        <nde-form-element slot="title" class="title inverse" .showLabel="${false}" hideValidation debounceTimeout="0" .actor="${this.formActorLocalTerm}" .translator="${this.translator}" field="name">
          <input type="text" slot="input"  class="name" placeholder="${this.translator.translate('term.title-placeholder')}"/>
        </nde-form-element>

        <div slot="subtitle">${this.translator.translate('term.description-placeholder')}</div>

        <div slot="icon" @click=${() => this.formActorLocalTerm.send(new FormSubmittedEvent())}>
          ${unsafeSVG(Plus)}
        </div>
      </nde-large-card>
      `: ''}

      <!-- show selected terms -->
      ${this.selectedTerms?.length > 0 ? html`
      <div class="term-list">
        <p class="title">
          ${this.selectedTerms.length} ${ this.translator.translate(this.selectedTerms.length === 1 ? 'term.term-selected' : 'term.terms-selected').toLowerCase()}
        </p>
        ${ this.selectedTerms?.map((term) => html`
          <nde-large-card
          class="term-card"
          .showImage="${false}"
          .showContent="${term.description?.length > 0 || term.alternateName?.length > 0 || term.broader?.length > 0 || term.narrower?.length > 0}"
          @click=${() => this.actor.send(new ClickedTermEvent(term))}>
            <div slot="title">${ term.name }</div>
            <div slot="subtitle">${ term.uri }</div>
            <div slot="icon">
              ${unsafeSVG(CheckboxChecked)}
            </div>
            <div slot="content">
              ${ term.description?.length > 0 ? html`<p>${this.translator.translate('term.field.description')}: ${ term.description }</p>` : ''}
              ${ term.alternateName?.length > 0 ? html`<p>${this.translator.translate('term.field.alternateName')}: ${ term.alternateName.join(', ') }</p>` : ''}
              ${ term.broader?.length > 0 ? html`<p>${this.translator.translate('term.field.broader')}: ${ term.broader.map((broader) => broader.name).join(', ') }</p>` : ''}
              ${ term.narrower?.length > 0 ? html`<p>${this.translator.translate('term.field.narrower')}: ${ term.narrower.map((narrower) => narrower.name).join(', ') }</p>` : ''}
              ${ term.hiddenName?.length > 0 ? html`<p>${this.translator.translate('term.field.hiddenName')}: ${ term.hiddenName  }</p>` : ''}
            </div>
          </nde-large-card>`)}
      </div>` : ''}

      <!-- show search results -->
      ${this.searchResultsMap && Object.keys(this.searchResultsMap).length > 0 ? html`
      <div class="term-list">
        ${Object.keys(this.searchResultsMap).map((key) => html`
          <p class="title">
            ${this.sources?.find((source) => source.uri === key)?.name ?? key} (${this.searchResultsMap[key]?.length} ${this.translator.translate(this.searchResultsMap[key]?.length === 1 ? 'term.term' : 'term.terms').toLowerCase()})
          </p>
          ${this.searchResultsMap[key]?.map((term) => html`
            <nde-large-card
            class="term-card"
            .showImage="${false}"
            .showContent="${term.description?.length > 0 || term.alternateName?.length > 0 || term.broader?.length > 0 || term.narrower?.length > 0}"
            @click=${() => this.actor.send(new ClickedTermEvent(term))}>
              <div slot="title">${ term.name }</div>
              <div slot="subtitle">${ term.uri }</div>
              <div slot="icon">
                ${ this.selectedTerms?.find((selected) => selected.uri === term.uri) ? unsafeSVG(CheckboxChecked) : unsafeSVG(CheckboxUnchecked)}
              </div>
              <div slot="content">
              ${ term.description?.length > 0 ? html`<p>${this.translator.translate('term.field.description')}: ${ term.description }</p>` : ''}
              ${ term.alternateName?.length > 0 ? html`<p>${this.translator.translate('term.field.alternateName')}: ${ term.alternateName.join(', ') }</p>` : ''}
              ${ term.broader?.length > 0 ? html`<p>${this.translator.translate('term.field.broader')}: ${ term.broader.map((broader) => broader.name).join(', ') }</p>` : ''}
              ${ term.narrower?.length > 0 ? html`<p>${this.translator.translate('term.field.narrower')}: ${ term.narrower.map((narrower) => narrower.name).join(', ') }</p>` : ''}
              ${ term.hiddenName?.length > 0 ? html`<p>${this.translator.translate('term.field.hiddenName')}: ${ term.hiddenName  }</p>` : ''}
              </div>
            </nde-large-card>
          `)}
        `)}
      </div>
      ` : ''}

        ${(this.searchResultsMap && Object.keys(this.searchResultsMap).length < 1)
    ? html`
        <div class='empty'>
          ${unsafeSVG(Empty)}
          <p>${this.translator?.translate('term.no-search-results')}</p>
        </div>
    ` : ''}

      `;

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
        a {
          cursor: pointer;
          text-decoration: underline;
          color: var(--colors-primary-light);
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
          gap: var(--gap-normal);
        }
        .search-form div {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          gap: var(--gap-normal);
        }

        .inputs {
          width: 75%;
        }

        .buttons {
          width: 25%;
        }

        .search-form div button {
          height: 45px;
          min-width: 150px;
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
        .term-list:first-of-type {
          margin-bottom: var(--gap-large);
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
        nde-large-card nde-form-element input {
          height: var(--gap-normal);
          padding: 0;
          line-height: var(--gap-normal);
          overflow: hidden;
          font-weight: var(--font-weight-bold);
          font-size: var(--font-size-normal);
        }
        .empty {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: var(--gap-large);
        }
        .empty > p {
          color: var(--colors-foreground-dark);
        }
        .empty > svg {
          width: 40%;
          height: auto;
        }
      `,
    ];

  }

}

export default TermSearchComponent;
