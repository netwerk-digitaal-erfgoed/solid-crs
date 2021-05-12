import { html, property, PropertyValues, internalProperty, unsafeCSS, css, CSSResult, TemplateResult } from 'lit-element';
import { interpret, State } from 'xstate';
import { from } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ArgumentError, Collection, ConsoleLogger, Logger, LoggerLevel, MemoryTranslator, Translator, CollectionObjectMemoryStore, MemoryStore } from '@digita-ai/nde-erfgoed-core';
import { Alert } from '@digita-ai/nde-erfgoed-components';
import { RxLitElement } from 'rx-lit';
import { Theme, Logout, Logo, Plus } from '@digita-ai/nde-erfgoed-theme';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { AppActors, AppAuthenticateStates, AppContext, AppFeatureStates, appMachine, AppRootStates } from './app.machine';
import nlNL from './i8n/nl-NL.json';
import { AppEvents } from './app.events';
import { SolidSDKService } from './common/solid/solid-sdk.service';
import { CollectionEvents, SelectedCollectionEvent } from './features/collection/collection.events';
import { SolidProfile } from './common/solid/solid-profile';

/**
 * The root page of the application.
 */
export class AppRootComponent extends RxLitElement {

  /**
   * The component's logger.
   */
  @property({ type: Object })
  public logger: Logger = new ConsoleLogger(LoggerLevel.silly, LoggerLevel.silly);

  /**
   * The component's translator.
   */
  @property({ type: Object })
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
  actor = interpret(
    (appMachine(
      new SolidSDKService(this.logger),
      new MemoryStore<Collection>([
        {
          uri: 'collection-uri-1',
          name: 'Collection 1',
          description: 'This is collection 1',
        },
        {
          uri: 'collection-uri-2',
          name: 'Collection 2',
          description: 'This is collection 2',
        },
      ]),
      new CollectionObjectMemoryStore([
        {
          uri: 'object-uri-1',
          name: 'Object 1',
          description: 'This is object 1',
          image: 'https://images.unsplash.com/photo-1615390164801-cf2e70f32b53?ixid=MnwxMjA3fDB8MHxwcm9maWxlLXBhZ2V8M3x8fGVufDB8fHx8&ixlib=rb-1.2.1&w=1000&q=80',
          subject: null,
          type: null,
          updated: 0,
          collection: 'collection-uri-1',
        },
        {
          uri: 'object-uri-2',
          name: 'Object 2',
          description: 'This is object 2',
          image: 'https://images.unsplash.com/photo-1615390164801-cf2e70f32b53?ixid=MnwxMjA3fDB8MHxwcm9maWxlLXBhZ2V8M3x8fGVufDB8fHx8&ixlib=rb-1.2.1&w=1000&q=80',
          subject: null,
          type: null,
          updated: 0,
          collection: 'collection-uri-1',
        },
        {
          uri: 'object-uri-3',
          name: 'Object 3',
          description: 'This is object 3',
          image: 'https://images.unsplash.com/photo-1615390164801-cf2e70f32b53?ixid=MnwxMjA3fDB8MHxwcm9maWxlLXBhZ2V8M3x8fGVufDB8fHx8&ixlib=rb-1.2.1&w=1000&q=80',
          subject: null,
          type: null,
          updated: 0,
          collection: 'collection-uri-1',
        },
        {
          uri: 'object-uri-4',
          name: 'Object 4',
          description: 'This is object 4',
          image: 'https://images.unsplash.com/photo-1615390164801-cf2e70f32b53?ixid=MnwxMjA3fDB8MHxwcm9maWxlLXBhZ2V8M3x8fGVufDB8fHx8&ixlib=rb-1.2.1&w=1000&q=80',
          subject: null,
          type: null,
          updated: 0,
          collection: 'collection-uri-1',
        },
      ]),
      {
        uri: null,
        name: this.translator.translate('nde.features.collections.new-collection-name'),
        description: this.translator.translate('nde.features.collections.new-collection-description'),
      },
    )).withContext({
      alerts: [],
    }), { devTools: true },
  );

  /**
   * The state of this component.
   */
  @internalProperty()
  state: State<AppContext>;

  /**
   * The state of this component.
   */
  @internalProperty()
  collections: Collection[];

  /**
   * The profile of the current user.
   */
  @internalProperty()
  profile: SolidProfile;

  /**
   * The selected collection of the current user.
   */
  @internalProperty()
  selected: Collection;

  /**
   * Dismisses an alert when a dismiss event is fired by the AlertComponent.
   *
   * @param event The event fired when dismissing an alert.
   */
  dismiss(event: CustomEvent<Alert>): void {

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
  firstUpdated(changed: PropertyValues): void {

    super.firstUpdated(changed);

    this.subscribe('state', from(this.actor));

    this.subscribe('collections', from(this.actor).pipe(
      map((state) => state.context?.collections),
    ));

    this.subscribe('profile', from(this.actor).pipe(
      map((state) => state.context?.profile),
    ));

    this.subscribe('selected', from(this.actor).pipe(
      map((state) => state.context?.selected),
    ));

  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    return html`
    ${ this.state?.matches({ [AppRootStates.AUTHENTICATE]: AppAuthenticateStates.AUTHENTICATED }) ? html`
    <nde-sidebar>
      <nde-content-header>
        <div slot="icon">${ unsafeSVG(Logo) }</div>
        <div slot="title">${this.profile?.name}</div>
        <div slot="actions"><button class="no-padding" @click="${() => this.actor.send(AppEvents.LOGGING_OUT)}">${unsafeSVG(Logout)}</button></div>
      </nde-content-header>
      <nde-sidebar-list>
        <nde-sidebar-list-item slot="item" isTitle inverse>
          <div slot="title">${this.translator?.translate('nde.navigation.collections.title')}</div>
          <div slot="actions" @click="${() => this.actor.send(AppEvents.CLICKED_CREATE_COLLECTION)}">${ unsafeSVG(Plus) }</div>
        </nde-sidebar-list-item>
        ${this.collections?.map((collection) => html`<nde-sidebar-list-item slot="item" inverse ?selected="${ collection.uri === this.selected.uri}" @click="${() => this.actor.send(CollectionEvents.SELECTED_COLLECTION, { collection })}"><div slot="title">${collection.name}</div></nde-sidebar-list-item>`)}
      </nde-sidebar-list>
    </nde-sidebar>
    ` : '' }  
    ${ this.state?.matches({ [AppRootStates.FEATURE]: AppFeatureStates.AUTHENTICATE }) ? html`<nde-authenticate-root .actor='${this.actor.children.get(AppActors.AUTHENTICATE_MACHINE)}' .logger='${this.logger}' .translator='${this.translator}'></nde-authenticate-root>` : '' }  
    ${ this.state?.matches({ [AppRootStates.FEATURE]: AppFeatureStates.COLLECTION }) ? html`<nde-collection-root .actor='${this.actor.children.get(AppActors.COLLECTION_MACHINE)}' .collectionCount='${this.collections.length}' .logger='${this.logger}' .translator='${this.translator}'></nde-collection-root>` : '' }  
    `;

  }

  /**
   * The styles associated with the component.
   */
  static get styles(): CSSResult[] {

    return [
      unsafeCSS(Theme),
      css`
        :host {
          background-color: var(--colors-background-normal);
          display: flex;
          flex-direction: row;
        }

        :host > * {
          flex: 1 1;
        }

        :host nde-sidebar {
          flex: 0 0 var(--size-sidebar);
        }

        nde-sidebar {
          display: flex;
          flex-direction: column;
        }

        nde-sidebar > * {
          margin-bottom: var(--gap-normal);
          display: block;
        }

        nde-sidebar > *:last-child {
          margin-bottom: 0px;
        }

        nde-content-header div[slot="icon"] svg {
          fill: var(--colors-foreground-inverse);
        }

        div[slot="actions"] svg {
          max-height: var(--gap-normal);
          width: var(--gap-normal);
        }
      `,
    ];

  }

}
