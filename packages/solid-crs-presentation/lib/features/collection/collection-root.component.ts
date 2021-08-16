import { html, property, PropertyValues, internalProperty, unsafeCSS, css, TemplateResult, CSSResult } from 'lit-element';
import { ArgumentError, Collection, CollectionObject, Logger, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { Alert } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { map } from 'rxjs/operators';
import { from } from 'rxjs';
import { Interpreter, State } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { Collection as CollectionIcon, Empty, Theme } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { DismissAlertEvent } from '../../app.events';
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

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    // Create an alert components for each alert.
    const alerts = this.alerts?.map((alert) => html`<nde-alert .logger='${this.logger}' .translator='${this.translator}' .alert='${alert}' @dismiss="${this.handleDismiss}"></nde-alert>`);

    const showLoading = !this.state?.matches(CollectionStates.IDLE);

    return !!this.actor && !!this.collection ? html`
    
    ${ showLoading ? html`<nde-progress-bar></nde-progress-bar>` : html``}

    <nde-content-header inverse>
      <div slot="icon">${ unsafeSVG(CollectionIcon) }</div>
      <div slot="title" class="title">
        ${this.collection.name}
      </div>
      <div slot="subtitle" class="subtitle">
        ${ this.collection.description && this.collection.description.length > 0 ? this.collection.description : this.translator.translate('nde.common.form.description-placeholder') }
      </div>
    </nde-content-header>

    <div class="content">
      ${ alerts }
      
      ${this.state?.matches(CollectionStates.LOADING)
    ? html``
    : html`
                ${this.objects?.length
    ? html`
          <div class='three-column-content-grid'>
            ${this.objects.map((object) => html`<nde-object-card @click="${() => this.actor.send(ObjectEvents.SELECTED_OBJECT, { object })}" .translator=${this.translator} .object=${object}></nde-object-card>`)}
          </div>
        `
    : html`
          <div class="empty-container">
            <div class='empty'>
              ${unsafeSVG(Empty)}
              <div class='text'>${this.translator?.translate('nde.features.collections.root.empty.create-object-title')}</div>
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
        nde-alert {
          margin-bottom: var(--gap-large);
        }
        .content {
          margin-top: 1px;
          padding: var(--gap-large);
          height: 100%;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
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
      `,
    ];

  }

}
