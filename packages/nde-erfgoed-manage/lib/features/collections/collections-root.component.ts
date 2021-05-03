import { html, property, PropertyValues, internalProperty, unsafeCSS } from 'lit-element';
import { ArgumentError, Collection, Logger, Translator } from '@digita-ai/nde-erfgoed-core';
import { Alert } from '@digita-ai/nde-erfgoed-components';
import { map, tap } from 'rxjs/operators';
import { from } from 'rxjs';
import { Interpreter, State} from 'xstate';
import { RxLitElement } from 'rx-lit';
import { Theme } from '@digita-ai/nde-erfgoed-theme';
import { AppEvents } from '../../app.events';
import { CollectionsEvents } from './collections.events';
import { CollectionsContext, CollectionsStates } from './collections.machine';

/**
 * The root page of the collections feature.
 */
export class CollectionsRootComponent extends RxLitElement {

  /**
   * The component's logger.
   */
  @property({type: Logger})
  public logger: Logger;

  /**
   * The component's translator.
   */
  @property({type: Translator})
  public translator: Translator;

  /**
   * The actor controlling this component.
   */
  @property({type: Object})
  public actor: Interpreter<CollectionsContext>;

  /**
   * The component's alerts.
   */
  @property({type: Array})
  public alerts: Alert[];

  /**
   * The state of this component.
   */
  @internalProperty()
  state?: State<CollectionsContext>;

  /**
   * The collections which will be summarized by the component.
   */
  @property({ type: Array })
  collections?: Collection[];

  /**
   * Hook called on at every update after connection to the DOM.
   */
  updated(changed: PropertyValues) {
    super.updated(changed);

    if(changed.has('actor') && this.actor){
      if(this.actor.parent){
        this.subscribe('alerts', from(this.actor.parent)
          .pipe(map((state) => state.context?.alerts)));
      }

      this.subscribe('state', from(this.actor).pipe(
        tap((state) => this.logger.debug(CollectionsRootComponent.name, 'CollectionState change:', state)),
      ));

      this.subscribe('collections', from(this.actor).pipe(
        map((state) => state.context?.collections),
      ));
    }
  }

  /**
   * Handles a dismiss event by sending a dismiss alert event to its parent.
   *
   * @param event Dismiss event dispatched by an alert componet.
   */
  handleDismiss(event: CustomEvent<Alert>) {
    if (!event || !event.detail) {
      throw new ArgumentError('Argument event || event.detail should be set.', event && event.detail);
    }

    if (!this.actor || !this.actor.parent) {
      throw new ArgumentError('Argument this.actor || !this.actor.parent should be set.', this.actor || !this.actor.parent);
    }

    this.actor.parent.send(AppEvents.DISMISS_ALERT, { alert: event.detail });
  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {
    // Create an alert components for each alert.
    const alerts = this.alerts?.map((alert) => html`<nde-alert .logger='${this.logger}' .translator='${this.translator}' .alert='${alert}' @dismiss="${this.handleDismiss}"></nde-alert>`);

    const loading = this.state?.matches(CollectionsStates.LOADING) ?? false;
    return html`
    <p>${this.translator?.translate('nde.collections.root.title')}</p>
    ${ alerts }
    <nde-collections .collections='${this.collections}' .logger='${this.logger}' .translator='${this.translator}'></nde-collections>
    <button @click="${() => this.actor.send(CollectionsEvents.CLICKED_LOAD)}" ?disabled="${loading}">Load some</button>
    <button @click="${() => this.actor.send(CollectionsEvents.CLICKED_ADD)}" ?disabled="${loading}">Add one</button>
    <div></div>
  `;
  }

  /**
   * The styles associated with the component.
   */
  static get styles() {
    return [
      unsafeCSS(Theme),
    ];
  }

}
