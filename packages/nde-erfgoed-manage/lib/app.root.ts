import { html, property, PropertyValues, internalProperty, unsafeCSS, css } from 'lit-element';
import { interpret, Interpreter, State } from 'xstate';
import { from } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ArgumentError, ConsoleLogger, Logger, LoggerLevel, MemoryTranslator, Translator } from '@digita-ai/nde-erfgoed-core';
import { Alert } from '@digita-ai/nde-erfgoed-components';
import { RxLitElement } from 'rx-lit';
import { Theme, Logout } from '@digita-ai/nde-erfgoed-theme';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { AppActors, AppAuthenticateStates, AppContext, AppFeatureStates, appMachine, AppRootStates } from './app.machine';
import nlNL from './i8n/nl-NL.json';
import { AppEvents } from './app.events';
import { CollectionsRootComponent } from './features/collections/collections-root.component';
import { SolidSDKService } from './common/solid/solid-sdk.service';

/**
 * The root page of the application.
 */
export class AppRootComponent extends RxLitElement {

  /**
   * The component's logger.
   */
  @property({type: Logger})
  public logger: Logger = new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly);

  /**
   * The component's translator.
   */
  @property({type: Translator})
  public translator: Translator = new MemoryTranslator(nlNL, 'nl-NL');

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
  actor: Interpreter<AppContext> = interpret(
    appMachine(
      new SolidSDKService(new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly)),
    )
      .withContext({
        alerts: [],
      }), { devTools: true},
  );

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
      tap((state) => this.logger.debug(CollectionsRootComponent.name, 'AppState change:', {actor: this.actor, state})),
    ));
  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {
    return html`
    ${ this.state?.matches({[AppRootStates.AUTHENTICATE]: AppAuthenticateStates.AUTHENTICATED}) ? html`<nde-sidebar><button @click="${() => this.actor.send(AppEvents.LOGGED_OUT)}">${unsafeSVG(Logout)}</button></nde-sidebar>` : '' }  
    ${ this.state?.matches({[AppRootStates.FEATURE]: AppFeatureStates.AUTHENTICATE}) ? html`<nde-authenticate-root .actor='${this.actor.children.get(AppActors.AUTHENTICATE_MACHINE)}' .logger='${this.logger}' .translator='${this.translator}'></nde-authenticate-root>` : '' }  
    ${ this.state?.matches({[AppRootStates.FEATURE]: AppFeatureStates.COLLECTIONS}) ? html`<nde-collections-root .actor='${this.actor.children.get(AppActors.COLLECTIONS_MACHINE)}' .logger='${this.logger}' .translator='${this.translator}'></nde-collections-root>` : '' }  
    `;
  }

  /**
   * The styles associated with the component.
   */
  static get styles() {
    return [
      unsafeCSS(Theme),
      css`
        :host {
          height: 100%;
          background-color: var(--colors-background-normal);
          display: flex;
          flex-direction: row;
          align-items: stretch;
        }

        :host * {
          flex: 1 0;
        }

        :host nde-sidebar {
          flex: 0 0 var(--size-sidebar);
        }
      `,
    ];
  }

}
