import { html, property, PropertyValues, internalProperty, unsafeCSS } from 'lit-element';
import { Collection, Logger, Translator } from '@digita-ai/nde-erfgoed-core';
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
   * Hook called on first update after connection to the DOM.
   * It subscribes to the actor, logs state changes, and pipes state to the properties.
   */
  firstUpdated(changed: PropertyValues) {
    super.firstUpdated(changed);

    this.subscribe('state', from(this.actor).pipe(
      tap((state) => this.logger.debug(CollectionsRootComponent.name, 'CollectionState change:', state)),
    ));

    this.subscribe('collections', from(this.actor).pipe(
      map((state) => state.context.collections),
    ));

  }

  dismiss = (event: CustomEvent<Alert>) => this.actor.parent.send(AppEvents.DISMISS_ALERT, { alert: event.detail });

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {
    // Create an alert components for each alert.
    const alerts = this.alerts?.map((alert) => html`<nde-alert .logger='${this.logger}' .translator='${this.translator}' .alert='${alert}' @dismiss="${this.dismiss}"></nde-alert>`);

    const loading = this.state?.matches(CollectionsStates.LOADING) ?? false;
    return html`
    <p>${this.translator.translate('nde.collections.root.title')}</p>
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
