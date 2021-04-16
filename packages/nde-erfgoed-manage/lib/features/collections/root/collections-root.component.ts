/* eslint-disable no-console */
import { css, html, property, PropertyValues, internalProperty } from 'lit-element';
import { Collection } from '@digita-ai/nde-erfgoed-core';
import { map, tap } from 'rxjs/operators';
import { from, of } from 'rxjs';
import { SpawnedActorRef, State} from 'xstate';
import { RxLitElement } from 'rx-lit';
import { CollectionsContext } from '../collections.context';
import { CollectionsEvent, CollectionsEvents } from '../collections.events';
import { CollectionsStates } from '../collections.states';

/**
 * The root page of the collections feature.
 */
export class CollectionsRootComponent extends RxLitElement {

  /**
   * The actor controlling this component.
   */
  @internalProperty()
  public actor: SpawnedActorRef<CollectionsEvent, State<CollectionsContext>>;

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
      tap((state) => console.log('CollectionState change:', state)),
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
    <nde-collections collections='${ this.collections ? JSON.stringify(this.collections) : JSON.stringify([])}'></nde-collections>
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
