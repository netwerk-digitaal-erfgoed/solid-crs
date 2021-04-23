import { css, html, property, PropertyValues, internalProperty } from 'lit-element';
import { interpret, State } from 'xstate';
import { from } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ConsoleLogger, Logger, LoggerLevel, MemoryTranslator, Translator } from '@digita-ai/nde-erfgoed-core';
import { RxLitElement } from 'rx-lit';
import { AppActors, appMachine } from './app.machine';
import { CollectionsRootComponent } from './features/collections/root/collections-root.component';
import { AppStates } from './app.states';
import { AppContext } from './app.context';
import nlBe from './i8n/nl-BE.json';

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
      tap((state) => this.logger.debug(CollectionsRootComponent.name, 'AppState change:', state)),
    ));
  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {
    return html`
    <link href="./dist/bundles/styles.css" rel="stylesheet">
    <h1>${this.translator.translate('nde.app.root.title')}</h1>
    ${ this.state?.matches(AppStates.COLLECTIONS) ?? false ? html`<nde-collections-root .actor='${this.actor.children.get(AppActors.COLLECTIONS_MACHINE)}' .logger='${this.logger}' .translator='${this.translator}'></nde-collections-root>` : html`` }
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
