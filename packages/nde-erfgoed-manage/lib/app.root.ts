import { css, html, property, PropertyValues, internalProperty, TemplateResult } from 'lit-element';
import { interpret, State } from 'xstate';
import { from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ArgumentError, ConsoleLogger, Logger, LoggerLevel, MemoryTranslator, Translator } from '@digita-ai/nde-erfgoed-core';
import { Alert, Event } from '@digita-ai/nde-erfgoed-components';
import { RxLitElement } from 'rx-lit';
import { AppActors, AppContext, AppFeatureStates, appMachine, AppRootStates } from './app.machine';
import nlBe from './i8n/nl-BE.json';
import { AppEvents } from './app.events';
import { CollectionsRootComponent } from './features/collections/collections-root.component';

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
  actor = interpret<AppContext, any, Event<AppEvents>>(appMachine.withContext({
    alerts: [],
    loggedIn: false,
    session: null,
  }), { devTools: true});

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

    // Create a authenticate root component if the app machine is in the correct state.
    const authenticate = html`<nde-authenticate-root .actor='${this.actor.children.get(AppActors.AUTHENTICATE_MACHINE)}' .logger='${this.logger}' .translator='${this.translator}'></nde-authenticate-root>`;

    // Create a authenticate root component if the app machine is in the correct state.
    const collections = html`<nde-collections-root .actor='${this.actor.children.get(AppActors.COLLECTIONS_MACHINE)}' .logger='${this.logger}' .translator='${this.translator}'></nde-collections-root>`;

    let currentPage: TemplateResult;

    switch((this.actor.state.value as any)[AppRootStates.FEATURE]) {

    case AppFeatureStates.AUTHENTICATE: currentPage = authenticate; break;

    case AppFeatureStates.COLLECTIONS: currentPage = collections; break;

    default: currentPage = authenticate;

    }

    return html`
    <link href="./dist/bundles/styles.css" rel="stylesheet">
    <h1>${this.translator.translate('nde.app.root.title')}</h1>
    ${ alerts }
    ${ currentPage }  
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
