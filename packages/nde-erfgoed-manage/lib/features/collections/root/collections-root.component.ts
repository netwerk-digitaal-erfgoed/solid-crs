import { LitElement, css, html, property } from 'lit-element';
import { Component } from '@digita-ai/semcom-core';
import { Collection } from '@digita-ai/nde-erfgoed-core';
import { select, dispatch } from '../../../app.store';
import { getAllCollections } from '../collections.slice';

/**
 * The root page of the collections feature.
 */
export class CollectionsRootComponent extends LitElement implements Component {

  /**
   * The collections which will be summarized by the component.
   */
  @property({type: Array})
  private collections: Collection[] = [];

  constructor() {
    super();

    select<Collection[]>((state) => state.collections.collections).subscribe((collections) => this.collections = collections);
    dispatch(getAllCollections());
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

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {
    return html`
    <link href="./dist/bundles/styles.css" rel="stylesheet">
    Header
    <nde-collections collections='${JSON.stringify(this.collections)}'></nde-collections>
  `;
  }
}
