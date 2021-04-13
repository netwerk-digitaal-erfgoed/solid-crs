import { LitElement, css, html, property, PropertyValues } from 'lit-element';
import { Component } from '@digita-ai/semcom-core';
import { interpret } from 'xstate';
import { appMachine } from './app.machine';
import { CollectionsRootComponent } from './features/collections/root/collections-root.component';

/**
 * The root page of the application.
 */
export class AppRootComponent extends LitElement implements Component {

  private appService = interpret(appMachine);

  constructor() {
    super();
    this.appService.start().onTransition((state) => {
      // eslint-disable-next-line no-console
      console.log('AppState change', state);
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
    return null;
  }

  firstUpdated(changed: PropertyValues) {
    super.firstUpdated(changed);

    if (this.appService.state.value === 'collections') {
      const collectionsRoot = document.createElement('nde-collections-root') as CollectionsRootComponent;
      collectionsRoot.actor = this.appService.children.get('collections');
      this.shadowRoot.appendChild(collectionsRoot);
    }
  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {
    return html`
    <link href="./dist/bundles/styles.css" rel="stylesheet">
    <h1>Header</h1>
  `;
  }

}
