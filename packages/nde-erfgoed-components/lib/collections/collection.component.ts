import { LitElement, css, html, property } from 'lit-element';
import type { Component } from '@digita-ai/semcom-core';
import { Collection } from './collection.model';

export default class CollectionComponent extends LitElement implements Component {

  @property({type: Object})
  private collection: Collection = null;

  static get styles() {
    return [
      css`
        .collection { }
      `,
    ];
  }

  data (entry: string, customFetch?: (input: RequestInfo, init?: RequestInit) => Promise<Response>): Promise<void> {
    const myFetch = customFetch ? customFetch : fetch;

    return myFetch(entry)
      .then((response) => response.text())
      .then(() => {
        this.collection = {name: 'Test'};
      });

  }

  render() {
    return html`
    <div class="collection">
      <div>${this.collection ? this.collection.name : 'Unknown'}</div>
    </div>
  `;
  }
}
