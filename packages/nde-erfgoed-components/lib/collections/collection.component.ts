import { LitElement, css, html, property } from 'lit-element';
import type { Component } from '@digita-ai/semcom-core';
import { Collection } from '@digita-ai/nde-erfgoed-core';

/**
 * A component which shows the details of a single collection.
 */
export class CollectionComponent extends LitElement implements Component {

  /**
   * The collection which will be rendered by the component.
   */
  @property({type: Object})
  private collection: Collection = null;

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
        this.collection = {uri:'test', name: 'Test'};
      });

  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {
    return html`
    <link href="./dist/bundles/styles.css" rel="stylesheet">
    <div class="collection">
      <div>${this.collection ? this.collection.name : 'Unknown'}</div>
      <button>Save</button>
    </div>
  `;
  }
}

export default CollectionComponent;
