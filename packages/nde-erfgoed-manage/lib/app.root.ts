import { css, html, property, PropertyValues, internalProperty } from 'lit-element';
import { interpret, State } from 'xstate';
import { from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ArgumentError, ConsoleLogger, Logger, LoggerLevel, MemoryTranslator, Translator } from '@digita-ai/nde-erfgoed-core';
import { Alert } from '@digita-ai/nde-erfgoed-components';
import { RxLitElement } from 'rx-lit';
import { AppActors, appMachine } from './app.machine';
import { CollectionsRootComponent } from './features/collections/root/collections-root.component';
import { AppStates } from './app.states';
import { AppContext } from './app.context';
import nlBe from './i8n/nl-BE.json';
import { AppEvents } from './app.events';

/**
 * The root page of the application.
 */
export class AppRootComponent extends RxLitElement {

  /**
   * The component's alerts.
   */
  @property({type: Array})
  public alerts: Alert[];

  /**
   * The component's logger.
   */
  @property({type: Logger})
  public logger: Logger = new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly);

  /**
   * The component's translator.
   */
  @property({type: Translator})
  public translator: Translator = new MemoryTranslator(nlBe, 'nl-BE');

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
  actor = interpret(appMachine.withContext({
    alerts: [],
  }));

  /**
   * The state of this component.
   */
  @internalProperty()
  state: State<AppContext>;

  /**
   * Dismisses an alert when a dismiss event is fired by the AlertComponent.
   *
   * @param event The event fired when dismissing an alert.
   */
  dismiss(event: CustomEvent<Alert>) {
    this.logger.debug(AppRootComponent.name, 'Dismiss', event);

    if (!event) {
      throw new ArgumentError('Argument event should be set.', event);
    }

    if (!event.detail) {
      throw new ArgumentError('Argument event.detail should be set.', event.detail);
    }

    this.actor.send(AppEvents.DISMISS_ALERT, { alert: event.detail });
  }

  /**
   * Hook called after first update after connection to the DOM.
   * It subscribes to the actor, logs state changes, and pipes state to the properties.
   */
  firstUpdated(changed: PropertyValues) {
    super.firstUpdated(changed);

    this.subscribe('state', from(this.actor).pipe(
      tap((state) => this.logger.debug(CollectionsRootComponent.name, 'AppState change:', state)),
    ));

    /**
     * Subscribes property alerts to changes in the app context.
     */
    this.subscribe('alerts', from(this.actor).pipe(
      map((state) => state.context.alerts),
    ));
  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {
    // Create an alert components for each alert.
    const alerts = this.alerts?.map((alert) => html`<nde-alert .logger='${this.logger}' .translator='${this.translator}' .alert='${alert}' @dismiss="${this.dismiss}"></nde-alert>`);

    // Create a collection root component if the app machine is in the correct state.
    const collections = this.state?.matches(AppStates.COLLECTIONS) ?? false ? html`<nde-collections-root .actor='${this.actor.children.get(AppActors.COLLECTIONS_MACHINE)}' .logger='${this.logger}' .translator='${this.translator}'></nde-collections-root>` : html``;

    return html`
    <link href="./dist/bundles/styles.css" rel="stylesheet">
    <h1>${this.translator.translate('nde.app.root.title')}</h1>
    ${ alerts }
    ${ collections }
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
