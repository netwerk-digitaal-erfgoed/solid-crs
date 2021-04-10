import { LitElement, css, html, property } from 'lit-element';
import type { Component } from '@digita-ai/semcom-core';
import { Collection } from './collection.model';

export default class CollectionSComponent extends LitElement implements Component {

  @property({type: Array})
  private collections: Collection[] = null;

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
        this.collections = [];
      });

  }

  render() {
    return html`
    <link href="./dist/styles.css" rel="stylesheet">
    <div class="collections">
    ${this.collections.map((collection) => html`<nde-collection collection='${JSON.stringify(collection)}'></nde-collection>`)}
    </div>
  `;
  }
}
