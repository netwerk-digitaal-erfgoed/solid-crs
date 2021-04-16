/* eslint-disable no-console */
import { css, html, property, PropertyValues, internalProperty } from 'lit-element';
import { interpret, State } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { from } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppActors, appMachine } from './app.machine';
import { CollectionsRootComponent } from './features/collections/root/collections-root.component';
import { AppStates } from './app.states';
import { AppContext } from './app.context';

/**
 * The root page of the application.
 */
export class AppRootComponent extends RxLitElement {

  /**
   * The constructor of the application root component,
   * which starts the root machine actor.
   */
  constructor() {
    super();
    this.actor.start();
  }

  /**
   * The actor controlling this component.
   * Since this is the application root component,
   * this is an interpreted machine given an initial context.
   */
  @internalProperty()
  actor = interpret(appMachine.withContext({}));

  /**
   * The state of this component.
   */
  @internalProperty()
  state: State<AppContext>;

  /**
   * Hook called after first update after connection to the DOM.
   * It subscribes to the actor, logs state changes, and pipes state to the properties.
   */
  firstUpdated(changed: PropertyValues) {
    super.firstUpdated(changed);

    this.subscribe('state', from(this.actor).pipe(
      tap((state) => console.log('AppState change', state)),
    ));
  }

  /**
   * Hook called after every update.
   * It passes child actors to the rendered child components.
   */
  updated(changed: PropertyValues) {
    super.updated(changed);
    this.shadowRoot.querySelectorAll('nde-collections-root').forEach((component: CollectionsRootComponent) => component.actor = this.actor.children.get(AppActors.COLLECTIONS_MACHINE));
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
    ${ this.state?.matches(AppStates.COLLECTIONS) ?? false ? html`<nde-collections-root></nde-collections-root>` : html`` }
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
