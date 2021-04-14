import { LitElement, css, html, property, PropertyValues } from 'lit-element';
import { Component } from '@digita-ai/semcom-core';
import { interpret } from 'xstate';
import { appMachine, appStates } from './app.machine';
import { CollectionsRootComponent } from './features/collections/root/collections-root.component';

/**
 * The root page of the application.
 */
export class AppRootComponent extends LitElement implements Component {

  private appService = interpret(appMachine);

  @property({type: String})
  private state: string = null;

  constructor() {
    super();
    this.appService.start().onTransition((state) => {
      // eslint-disable-next-line no-console
      console.log('AppState change', state);
    });

    this.appService.subscribe((state) => {
      this.state = state.value as string;
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

  updated(changed: PropertyValues) {
    super.updated(changed);
    this.shadowRoot.querySelectorAll('nde-collections-root').forEach((component: CollectionsRootComponent) => component.actor = this.appService.children.get('collections'));
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
    ${ this.state === 'collections' ? html`<nde-collections-root></nde-collections-root>` : html`` }
  `;
  }

}
