import { LitElement, css, html, property } from 'lit-element';
import { Component } from '@digita-ai/semcom-core';
import { tap } from 'rxjs/operators';
import { appService, appState } from './app.machine';
import { CollectionsRootComponent } from './features/collections/root/collections-root.component';

/**
 * The root page of the application.
 */
export class AppRootComponent extends LitElement implements Component {

  @property({type: String})
  private state: string = null;

  @property({type: Object})
  private collectionsService: Interpreter<CollectionsContext, any, AnyEventObject, {
    value: any;
    context: CollectionsContext;
  }> = null;

  constructor() {
    super();

    console.log('children', appService.children);
    this.collectionsService = appService.children.get('collections');
    appState
      .pipe(tap((state) => console.log('app', state)))
      .subscribe((state) => this.state = 'collections');
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

  connectedCallback() {
    super.connectedCallback();

    const collectionsRoot = document.createElement('nde-collections-root') as CollectionsRootComponent;
    collectionsRoot.collectionsService = this.collectionsService;

    this.appendChild(collectionsRoot);
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
    <div id="container"></div>
  `;
  }

  // ${this.state === 'collections' ? html`<nde-collections-root collectionsService=></nde-collections-root>` : 'Logged out'}
}
