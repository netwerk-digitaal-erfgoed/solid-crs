import { css, html, property, PropertyValues, internalProperty } from 'lit-element';
import { Collection, Logger, Translator } from '@digita-ai/nde-erfgoed-core';
import { Event } from '@digita-ai/nde-erfgoed-components';
import { map, tap } from 'rxjs/operators';
import { from } from 'rxjs';
import { SpawnedActorRef, State} from 'xstate';
import { RxLitElement } from 'rx-lit';
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
  public actor: SpawnedActorRef<Event<CollectionsEvents>, State<CollectionsContext>>;

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

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {
    const loading = this.state?.matches(CollectionsStates.LOADING) ?? false;
    return html`
    <link href="./dist/bundles/styles.css" rel="stylesheet">
    <p>${this.translator.translate('nde.collections.root.title')}</p>
    <nde-collections .collections='${this.collections}' .logger='${this.logger}' .translator='${this.translator}'></nde-collections>
    <button @click="${() => this.actor.send(CollectionsEvents.CLICKED_LOAD)}" ?disabled="${loading}">Load some</button>
    <button @click="${() => this.actor.send(CollectionsEvents.CLICKED_ADD)}" ?disabled="${loading}">Add one</button>
    <button @click="${() => this.actor.send(CollectionsEvents.CLICKED_LOGOUT)}" ?disabled="${loading}">Logout</button>
    <div></div>
  `;
  }

  /**
   * The styles associated with the component.
   */
  static get styles() {
    return [
      css`
        .collection { }
      `,
    ];
  }

}
