import { LitElement, css, html, property } from 'lit-element';
import { Component } from '@digita-ai/semcom-core';
import { Collection } from '@digita-ai/nde-erfgoed-core';
import { tap } from 'rxjs/operators';
import { from } from 'rxjs';
import {Interpreter, AnyEventObject, SpawnedActorRef, State} from 'xstate';
import { CollectionsContext } from '../collections.context';

/**
 * The root page of the collections feature.
 */
export class CollectionsRootComponent extends LitElement implements Component {

  /**
   * The collections which will be summarized by the component.
   */
  @property({type: Array})
  private collections: Collection[] = [];

  /**
   * The collections which will be summarized by the component.
   */
  @property({type: Object})
  public actor: SpawnedActorRef<any, State<CollectionsContext>>;

  constructor() {
    super();

  }

  connectedCallback() {
    super.connectedCallback();

    this.actor.subscribe((state) => {
      // eslint-disable-next-line no-console
      console.log('CollectionState change:', state);
      this.collections = state.context.collections;
    });
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

  /**
   * Loads data associated with the component.
   *
   * @param entry The resource which will be loaded by the component.
   * @param customFetch A custom fetch function provided by the host application.
   * @returns A promise when the data has been loaded.
   */
  data (entry: string, customFetch?: (input: RequestInfo, init?: RequestInit) => Promise<Response>): Promise<void> {
    const myFetch = customFetch ? customFetch : fetch;

    return myFetch(entry)
      .then((response) => response.text())
      .then(() => {
        this.collections = [];
      });

  }

  sendEvent(event: string) {
    return () => this.actor.send(event);
  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {
    return html`
    <link href="./dist/bundles/styles.css" rel="stylesheet">
    <nde-collections collections='${JSON.stringify(this.collections)}'></nde-collections>
    <button @click="${this.sendEvent('TEST')}">Test</button>
    <button @click="${this.sendEvent('LOGOUT')}">Logout</button>
  `;
  }
}
