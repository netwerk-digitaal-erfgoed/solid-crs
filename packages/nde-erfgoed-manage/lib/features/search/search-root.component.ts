import { html, property, PropertyValues, internalProperty, unsafeCSS, css, TemplateResult, CSSResult } from 'lit-element';
import { ArgumentError, Collection, CollectionObject, Logger, Translator } from '@digita-ai/nde-erfgoed-core';
import { Collection as CollectionIcon, Cross, Edit, Empty, Object as ObjectIcon, Plus, Save, Search, Theme, Trash } from '@digita-ai/nde-erfgoed-theme';
import { Alert } from '@digita-ai/nde-erfgoed-components';
import { map } from 'rxjs/operators';
import { from } from 'rxjs';
import { Interpreter, State } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { AppEvents } from '../../app.events';
import { SearchContext } from './search.machine';

/**
 * The root page of the collections feature.
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

    this.actor.parent.send(AppEvents.DISMISS_ALERT, { alert: event.detail });

  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    return html`
      <nde-content-header inverse>
        <div slot="icon">${ unsafeSVG(Search) }</div>
        <div slot="title">${this.translator?.translate('nde.features.search.header.search-results-for')} "${this.searchTerm}"</div>
        <div slot="subtitle">${this.translator?.translate('nde.features.search.header.subtitle')}</div>

        <div slot="actions"><button class="no-padding inverse" @click="${() => this.logger.info('this', 'cross clicked placeholder')}">${unsafeSVG(Cross)}</button></div>
      </nde-content-header>

      <div class="content">
      ${ this.alerts?.map((alert) => html`<nde-alert .logger='${this.logger}' .translator='${this.translator}' .alert='${alert}' @dismiss="${this.handleDismiss}"></nde-alert>`) }
      
      ${this.objects?.length || this.collections?.length
    ? html`

      ${this.collections.length
    ? html`
              <div class="title no-padding-top">
                ${unsafeSVG(CollectionIcon)} <span>Collecties</span>
              </div>
              <div class='grid'>
                ${this.collections.map((collection) => html`<nde-collection-card .translator=${this.translator} .collection=${collection}></nde-collection-card>`)}
              </div>
            ` : ''
}

          ${this.objects.length
    ? html`
              <div class="title">
                ${unsafeSVG(ObjectIcon)} <span>Objecten</span>
              </div>
              <div class='grid'>
                ${this.objects.map((object) => html`<nde-object-card .translator=${this.translator} .object=${object}></nde-object-card>`)}
              </div>
            ` : ''
}

        `
    : html`
          <div class="empty-container">
            No results ... WIP
          </div>
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
        :host {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .content {
          padding: var(--gap-large);
          height: 100%;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-gap: var(--gap-large);
        }
        @media only screen and (max-width: 1300px) {
          .grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media only screen and (max-width: 1000px) {
          .grid {
            grid-template-columns: repeat(1, 1fr);
          }
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
        .no-padding-top {
          padding-top: 0;
        }
      `,
    ];

  }

}
