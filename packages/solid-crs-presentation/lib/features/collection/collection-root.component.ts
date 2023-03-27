import { html, property, PropertyValues, internalProperty, unsafeCSS, css, TemplateResult, CSSResult, query } from 'lit-element';
import { ArgumentError, Collection, CollectionObject, Logger, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { Alert, PopupComponent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { map } from 'rxjs/operators';
import { from } from 'rxjs';
import { Interpreter, State } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { Collection as CollectionIcon, Dots, Empty, Theme } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { AddAlertEvent, DismissAlertEvent } from '../../app.events';
import { ObjectEvents } from '../object/object.events';
import { CollectionContext, CollectionStates } from './collection.machine';

/**
 * The root page of the collection feature.
 */
export class CollectionRootComponent extends RxLitElement {

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
  public actor: Interpreter<CollectionContext>;

  /**
   * The component's alerts.
   */
  @property({ type: Array })
  public alerts: Alert[];

  /**
   * The state of this component.
   */
  @internalProperty()
  state?: State<CollectionContext>;

  /**
   * The collections which will be summarized by the component.
   */
  @property({ type: Object })
  collection?: Collection;

  /**
   * The list of objects in the current collection.
   */
  @internalProperty()
  objects?: CollectionObject[];

  /**
   * Indicates if one the form fields has changed.
   */
  @internalProperty()
  objectsPerPage = 18;

  /**
   * Indicates if one the form fields has changed.
   */
  @internalProperty()
  pageIndex = 0;

  /**
   * The element containing the grid of collection objects.
   */
  @query('.content')
  pageContent: HTMLElement;

  /**
   * The popup component shown when the info menu is clicked
   */
  @query('nde-popup#info-popup')
  infoPopup: PopupComponent;

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

      this.subscribe('collection', from(this.actor)
        .pipe(map((state) => state.context?.collection)));

      this.subscribe('objects', from(this.actor)
        .pipe(map((state) => state.context?.objects)));

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

  onClickedCopy(value: string): Promise<void> {

    return navigator.clipboard.writeText(value);

  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    // Create an alert components for each alert.
    const alerts = this.alerts?.map((alert) => html`<nde-alert .logger='${this.logger}' .translator='${this.translator}' .alert='${alert}' @dismiss="${this.handleDismiss}"></nde-alert>`);

    const showLoading = !this.state?.matches(CollectionStates.IDLE);

    const toggleInfo = () => { this.infoPopup.toggle(); };

    return !!this.actor && !!this.collection ? html`
    
    ${ showLoading ? html`<nde-progress-bar></nde-progress-bar>` : html``}

    <nde-content-header inverse>
      <div slot="icon">${ unsafeSVG(CollectionIcon) }</div>
      <div slot="title" class="title">
        ${this.collection.name}
      </div>
      <div slot="subtitle" class="subtitle">
        ${ this.collection.description && this.collection.description.length > 0 ? this.collection.description : this.translator.translate('common.form.description-placeholder') }
      </div>
      <div slot="actions">
        <div @click="${() => toggleInfo()}">
          ${ unsafeSVG(Dots) }
          <nde-popup id="info-popup">
            <div slot="content">
              <a @click="${() => this.onClickedCopy(this.collection?.uri).then(() => this.actor.parent.send(new AddAlertEvent({ type: 'success', message: 'common.copied-uri' })))}">
                ${this.translator.translate('collections.root.menu.copy-uri')}
              </a>
            </div>
          </nde-popup>
        </div>
      </div>
    </nde-content-header>

    <div class="content">
      ${ alerts }
      
      ${this.state?.matches(CollectionStates.LOADING)
    ? html``
    : html`
                ${this.objects?.length
    ? html`

          <nde-paginator
            ?hidden="${this.objects.length <= this.objectsPerPage}"
            @next="${() => { this.pageIndex++; this.pageContent.scrollTo(0, 0); }}"
            @previous="${() => { this.pageIndex--; this.pageContent.scrollTo(0, 0); }}"
            .translator="${this.translator}"
            .pageIndex="${this.pageIndex}"
            .objectsPerPage="${this.objectsPerPage}"
            .objectsAmount="${this.objects.length}">
          </nde-paginator>

          <div class='three-column-content-grid'>
            ${this.objects.slice(this.pageIndex * this.objectsPerPage, this.pageIndex * this.objectsPerPage + this.objectsPerPage)
    .map((object) => html`<nde-object-card @click="${() => this.actor.send(ObjectEvents.SELECTED_OBJECT, { object })}" .translator=${this.translator} .object=${object}></nde-object-card>`)}
          </div>

          <nde-paginator
            ?hidden="${this.objects.length <= this.objectsPerPage}"
            @next="${() => { this.pageIndex++; this.pageContent.scrollTo(0, 0); }}"
            @previous="${() => { this.pageIndex--; this.pageContent.scrollTo(0, 0); }}"
            .translator="${this.translator}"
            .pageIndex="${this.pageIndex}"
            .objectsPerPage="${this.objectsPerPage}"
            .objectsAmount="${this.objects.length}">
          </nde-paginator>  
        `
    : html`
          <div class="empty-container">
            <div class='empty'>
              ${unsafeSVG(Empty)}
              <div class='text'>${this.translator?.translate('collections.root.empty.create-object-title')}</div>
            </div>
          </div>
        `
}
        `
}
    </div>
  ` : html``;

  }

  /**
   * The styles associated with the component.
   */
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
          gap: var(--gap-large);
        }
        nde-progress-bar {
          position: absolute;
          width: 100%;
          top: 0;
          left: 0;
        }
        nde-object-card, nde-collection-card {
          height: 227px;
        }
        button svg {
          max-width: var(--gap-normal);
          height: var(--gap-normal);
        }
        nde-content-header div[slot="title"]:hover, nde-content-header div[slot="subtitle"]:hover {
          cursor: pointer;
        }
        .name {
          font-weight: bold;
          font-size: var(--font-size-large);
        }
        .description {
          margin-top: var(--gap-tiny);
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
        .empty button {
          width: 260px;
          text-transform: none;
          padding: var(--gap-small) var(--gap-normal);
          display: flex;
          gap: var(--gap-normal);
          justify-content: flex-start;
          align-items: center;
        }
        .empty button span {
          display: inline-flex;
          align-items: center;
          height: var(--gap-normal);
        }
        .description {
          margin-top: var(--gap-tiny);
        }
        #info-popup {
          z-index: 110;
          height: auto;
          width: auto;
          position: absolute;
          left: unset;
          right: var(--gap-normal);
          top: var(--gap-huge);
          background-color: var(--colors-background-light);
          /* box-shadow: 0 0 5px grey; */
          border: 1px var(--colors-foreground-normal) solid;
        }
        #info-popup div {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        #info-popup a {
          padding: var(--gap-small);
          color: var(--colors-primary-normal);
          text-decoration: none;
          /* text-align: center; */
        }
        #info-popup a:hover {
          background-color: var(--colors-primary-normal);
          color: var(--colors-background-light);
        }
      `,
    ];

  }

}
