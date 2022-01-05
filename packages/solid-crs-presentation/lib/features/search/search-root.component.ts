import { html, property, PropertyValues, internalProperty, unsafeCSS, css, TemplateResult, CSSResult } from 'lit-element';
import { ArgumentError, Collection, CollectionObject, Logger, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { Collection as CollectionIcon, Cross, Empty, Object as ObjectIcon, Search, Theme } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { Alert } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { map } from 'rxjs/operators';
import { from } from 'rxjs';
import { Interpreter, State } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { DismissAlertEvent } from '../../app.events';
import { CollectionEvents } from '../collection/collection.events';
import { ObjectEvents } from '../object/object.events';
import { SearchContext, SearchStates } from './search.machine';
import { SearchEvents, SearchUpdatedEvent } from './search.events';

/**
 * The root page of the search feature.
 */
export class SearchRootComponent extends RxLitElement {

  /**
   * The component's logger.
   */
  @property({ type: Object })
  public logger: Logger;

  /**
   * The component's translator.
   */
  @property({ type: Object })
  public translator: Translator;

  /**
   * The actor controlling this component.
   */
  @property({ type: Object })
  public actor: Interpreter<SearchContext>;

  /**
   * The component's alerts.
   */
  @property({ type: Array })
  public alerts: Alert[];

  /**
   * The state of this component.
   */
  @internalProperty()
  state?: State<SearchContext>;

  /**
   * The collections that match the searched term.
   */
  @internalProperty()
  collections?: Collection[];

  /**
   * The objects matching the searched term
   */
  @internalProperty()
  objects?: CollectionObject[];

  /**
   * The searched term
   */
  @internalProperty()
  searchTerm = '';

  /**
   * Hook called on at every update after connection to the DOM.
   */
  updated(changed: PropertyValues): void {

    super.updated(changed);

    if(changed && changed.has('actor') && this.actor){

      if(this.actor.parent){

        this.subscribe('alerts', from(this.actor.parent)
          .pipe(map((state) => state.context?.alerts)));

      }

      this.subscribe('state', from(this.actor));

      this.subscribe('collections', from(this.actor)
        .pipe(map((state) => state.context?.collections)));

      this.subscribe('objects', from(this.actor)
        .pipe(map((state) => state.context?.objects)));

      this.subscribe('searchTerm', from(this.actor)
        .pipe(map((state) => state.context?.searchTerm)));

    }

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

    this.actor.parent.send(new DismissAlertEvent(event.detail));

  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    const showLoading = this.actor?.state?.matches(SearchStates.SEARCHING);

    return html`

      ${ showLoading ? html`<nde-progress-bar></nde-progress-bar>` : html``}

      <nde-content-header inverse>
        <div slot="icon">${ unsafeSVG(Search) }</div>
        <div slot="title">${this.translator?.translate('search.header.search-results-for')} "${this.searchTerm}"</div>
        <div slot="subtitle">${this.translator?.translate('search.header.subtitle')}</div>
        <div slot="actions" @click="${() => this.actor.send(new SearchUpdatedEvent(''))}">${ unsafeSVG(Cross) }</div>
      </nde-content-header>

      <div class="content">
      ${ this.alerts?.map((alert) => html`<nde-alert .logger='${this.logger}' .translator='${this.translator}' .alert='${alert}' @dismiss="${this.handleDismiss}"></nde-alert>`) }

      ${ this.state?.matches([ SearchStates.SEARCHING ])
    ? html``
    : html`
        ${this.objects?.length || this.collections?.length
    ? html`

      ${this.collections?.length
    ? html`
              <div class="title">
                ${unsafeSVG(CollectionIcon)} <span>${this.translator?.translate('search.root.collections')}</span>
              </div>
              <div class='three-column-content-grid'>
                ${this.collections.map((collection) => html`<nde-collection-card @click="${() => this.actor.parent?.send(CollectionEvents.SELECTED_COLLECTION, { collection })}" .translator=${this.translator} .collection=${collection}></nde-collection-card>`)}
              </div>
            ` : ''
}

          ${this.objects?.length
    ? html`
              <!-- <div class="title">
                ${unsafeSVG(ObjectIcon)} <span>${this.translator?.translate('search.root.objects')}</span>
              </div> -->
              <div class='three-column-content-grid'>
                ${this.objects.map((object) => html`<nde-object-card @click="${() => this.actor.parent?.send(ObjectEvents.SELECTED_OBJECT, { object })}" .translator=${this.translator} .object=${object}></nde-object-card>`)}
              </div>
            ` : ''
}

        `
    : html`
          <div class="empty-container">
            <div class='empty'>
              ${unsafeSVG(Empty)}
              <div class='text'>${this.translator?.translate('search.root.empty.no-search-results')}</div>
            </div>
          </div>
        `
}
        `
}
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

        nde-progress-bar {
          position: absolute;
          width: 100%;
          top: 0;
          left: 0;
        }

        *::-webkit-scrollbar-thumb {
          background-color: var(--colors-foreground-light);
          border: 3px solid var(--colors-background-normal);
        }
        *::-webkit-scrollbar-track {
          background: var(--colors-background-normal);
        }
        :host {
          scrollbar-color: var(--colors-foreground-light) var(--colors-background-normal);
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .content {
          margin-top: 1px;
          padding: var(--gap-large);
          height: 100%;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        .content > div:first-child {
          padding-top: 0;
        }
        nde-object-card, nde-collection-card {
          height: 227px;
        }
        button svg {
          max-width: var(--gap-normal);
          height: var(--gap-normal);
        }
        .title {
          padding: var(--gap-large) 0;
          color: var(--colors-primary-dark);
          font-weight: bold;
          display: flex;
          flex-direction: row;
          align-items: center;
        }
        .title svg {
          padding-right: var(--gap-normal);
          fill: var(--colors-foreground-normal);
        }
        .empty-container {
          display: flex;
          justify-content: center;
          flex-direction: column;
          height: 100%;
        }
        .empty {
          width: 100%;
          display: flex;
          flex-direction: column;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: var(--gap-large);
        }
        .empty .text {
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
