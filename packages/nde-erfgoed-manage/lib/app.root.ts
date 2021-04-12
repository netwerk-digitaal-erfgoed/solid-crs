import { LitElement, css, html, property } from 'lit-element';
import { Component } from '@digita-ai/semcom-core';
import { appService, appState } from './app.machine';

/**
 * The root page of the application.
 */
export class AppRootComponent extends LitElement implements Component {

  @property({type: String})
  private state: string = null;

  constructor() {
    super();

    appState
      .subscribe((state) => this.state = state.value);
    appService.start();
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
    return null;
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
    ${this.state === 'collections' ? html`<nde-collections-root></nde-collections>` : 'Logged out'}
  `;
  }
}
