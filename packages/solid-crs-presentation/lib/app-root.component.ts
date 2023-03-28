import { html, property, PropertyValues, internalProperty, unsafeCSS, css, CSSResult, TemplateResult } from 'lit-element';
import { ActorRef, EventObject, interpret, Interpreter, State } from 'xstate';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';
import { ArgumentError, Collection, CollectionObjectSolidStore, CollectionSolidStore, ConsoleLogger, Logger, LoggerLevel, MemoryTranslator, SolidProfile, Translator, TRANSLATIONS_LOADED, InboxService, SolidSDKService } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { Alert, FormActors, FormEvent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { RxLitElement } from 'rx-lit';
import { Theme, Cross, Search, Dropdown, Info, Logo } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';

import { AppActors, AppContext, AppDataStates, AppFeatureStates, appMachine, AppRootStates } from './app.machine';
import { ClickedHomeEvent, DismissAlertEvent } from './app.events';
import { CollectionEvents, SelectedCollectionEvent } from './features/collection/collection.events';
import { SearchEvent, SearchUpdatedEvent } from './features/search/search.events';
import { SearchContext } from './features/search/search.machine';

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
  public translator: Translator = new MemoryTranslator('nl-NL');

  /**
   * The constructor of the application root component,
   * which starts the root machine actor.
   */
  constructor() {

    super();
    this.actor?.start();

  }

  /**
   * The actor controlling this component.
   * Since this is the application root component,
   * this is an interpreted machine given an initial context.
   */
  @internalProperty()
  actor: Interpreter<AppContext, any, EventObject>;

  /**
   * The state of this component.
   */
  @internalProperty()
  state: State<AppContext>;

  /**
   * A list of all collections.
   */
  @internalProperty()
  collections: Collection[];

  /**
   * The profile of the current user.
   */
  @internalProperty()
  profile: SolidProfile;

  /**
   * The search term.
   */
  @internalProperty()
  searchTerm = '';

  /**
   * The selected collection of the current user.
   */
  @internalProperty()
  selected: Collection;

  /**
   * The actor responsible for the search field.
   */
  @internalProperty()
  formActor: ActorRef<FormEvent>;

  /**
   * The actor responsible for the search field.
   */
  @internalProperty()
  searchActor: ActorRef<SearchEvent>;

  /**
   * The last value of the search input field
   */
  @internalProperty()
  lastSearchTerm: string;

  /**
   * The solid service used throughout the application
   */
  private solidService = new SolidSDKService('Presentatiemodule');

  async connectedCallback(): Promise<void> {

    const language = new URL(window.location.href).searchParams.get('lang');
    if (language) await this.translator.setLang(language);

    await new Promise((resolve) => this.translator.addEventListener(TRANSLATIONS_LOADED, resolve));

    this.actor = interpret(
      appMachine(
        this.solidService,
        new CollectionSolidStore(this.solidService, new InboxService(this.solidService)),
        new CollectionObjectSolidStore(this.solidService)
      ).withContext({ alerts: [] }),
      { devTools: process.env.MODE === 'DEV' }
    );

    super.connectedCallback();
    this.actor.start();

  }

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

    this.actor.send(new DismissAlertEvent(event.detail));

  }

  firstUpdated(changed: PropertyValues): void {

    window.onpopstate = () => {

      window.location.reload();

    };

    super.firstUpdated(changed);

    this.subscribe('state', from(this.actor));

    this.subscribe('collections', from(this.actor).pipe(
      map((state) => state.context?.collections),
    ));

    this.subscribe('formActor', from(this.actor).pipe(
      map((state) => state.children[FormActors.FORM_MACHINE]),
    ));

    this.subscribe('profile', from(this.actor).pipe(
      map((state) => state.context?.profile),
    ));

    this.subscribe('selected', from(this.actor).pipe(
      map((state) => state.context.selected),
    ));

    this.subscribe('lastSearchTerm', from(this.actor).pipe(
      map((state) => state.context.lastSearchTerm),
    ));

  }

  /**
   * Hook called after first update after connection to the DOM.
   * It subscribes to the actor, logs state changes, and pipes state to the properties.
   */
  updated(changed: PropertyValues): void {

    if(changed.has('actor') && this.actor) {

      this.subscribe('searchActor', from(this.actor)
        .pipe(
          map((state) => state.children[AppActors.SEARCH_MACHINE])
        ));

    }

    if(changed.has('searchActor') && this.searchActor) {

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.subscribe('searchTerm', from((this.searchActor as unknown) as Interpreter<SearchContext, any, SearchEvent>).pipe(
        map((state) => state.context.searchTerm)
      ));

    }

    if(changed.has('searchActor') && !this.searchActor) {

      this.searchTerm = '';

    }

  }

  /**
   * Handles an update of the search field.
   *
   * @param event HTML event fired when the search input field is updated.
   */
  searchUpdated(event: KeyboardEvent): void {

    this.actor.send(new SearchUpdatedEvent((event.target as HTMLInputElement).value));

  }

  /**
   * Clears the search field.
   */
  clearSearchTerm(): void {

    this.actor.send(new SearchUpdatedEvent(''));

  }

  onCollectionSelected(customEvent: CustomEvent<Collection>): void {

    this.actor.send(new SelectedCollectionEvent(customEvent.detail));

  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    const showLoading = this.state?.matches({ [AppRootStates.DATA]: AppDataStates.LOADING_COLLECTIONS });

    return html`

    ${ showLoading ? html`<nde-progress-bar></nde-progress-bar>` : html``}

    <nde-sidebar inverse>
      <nde-content-header @click="${() => this.actor.send(new ClickedHomeEvent())}">
        ${ this.profile?.logo ? html`<img slot="icon" src="${this.profile?.logo}"/>` : html`<div slot="icon">${ unsafeSVG(Logo) }</div>` }
        <div slot="title">${this.profile?.name}</div>
      </nde-content-header>
      <nde-sidebar-item .padding="${false}" id="about-item">
        <nde-sidebar-list slot="content">
          <nde-sidebar-list-item slot="item" inverse
          @click="${() => this.actor.send(new ClickedHomeEvent())}"
          .selected="${this.state?.matches({ [AppRootStates.FEATURE]: AppFeatureStates.ABOUT })}">
            <div slot="title">${this.translator?.translate('navigation.about.title')}</div>
            <div slot="actions"> ${unsafeSVG(Info)} </div>
          </nde-sidebar-list-item>
        </nde-sidebar-list>
      </nde-sidebar-item>
      <nde-sidebar-item id="search-item">
        <div slot="content">
          <div class="search-title"> ${this.translator?.translate('navigation.search.title')} </div>
          <nde-form-element class="inverse" .submitOnEnter="${false}" .showLabel="${false}" .actor="${this.formActor}" .translator="${this.translator}" field="searchTerm" .debounceTimeout="${0}">
            <input type="text"
              slot="input"
              .value="${this.searchTerm||this.lastSearchTerm||''}"
              class="searchTerm"
              @input="${this.searchUpdated}"
            />
            ${this.searchTerm || this.lastSearchTerm
    ? html`<div class="cross" slot="icon" @click="${this.clearSearchTerm}">${ unsafeSVG(Cross) }</div>`
    : html`<div slot="icon">${ unsafeSVG(Search) }</div>`
}
          </nde-form-element>
          ${ this.state?.matches({ [AppRootStates.FEATURE]: AppFeatureStates.OBJECT }) && this.lastSearchTerm
    ? html`<div class="search-subtitle">
            ${ unsafeSVG(Dropdown) }
            <a @click="${() => this.actor.send(new SearchUpdatedEvent(this.lastSearchTerm))}">Terug naar zoekresultaten</a>
          </div>`
    : ''}
        </div>
      </nde-sidebar-item>
      <nde-sidebar-item .padding="${false}" .showBorder="${false}" id="collections-item">
        <nde-sidebar-list slot="content">
          <nde-sidebar-list-item slot="title" isTitle inverse>
            <div slot="title">${this.translator?.translate('navigation.collections.title')}</div>
          </nde-sidebar-list-item>
          ${this.collections?.map((collection) => html`<nde-sidebar-list-item slot="item" inverse ?selected="${ collection.uri === this.selected?.uri}" @click="${() => this.actor.send(CollectionEvents.SELECTED_COLLECTION, { collection })}"><div slot="title">${collection.name}</div></nde-sidebar-list-item>`)}
        </nde-sidebar-list>
      </nde-sidebar-item>
    </nde-sidebar> 
    ${ this.state?.matches({ [AppRootStates.FEATURE]: AppFeatureStates.COLLECTION }) ? html`<nde-collection-root .actor='${this.actor.children.get(AppActors.COLLECTION_MACHINE)}' .showDelete='${this.collections?.length > 1}' .logger='${this.logger}' .translator='${this.translator}'></nde-collection-root>` : '' }  
    ${ this.state?.matches({ [AppRootStates.FEATURE]: AppFeatureStates.SEARCH }) ? html`<nde-search-root .actor='${this.actor.children.get(AppActors.SEARCH_MACHINE)}' .logger='${this.logger}' .translator='${this.translator}'></nde-search-root>` : '' }
    ${ this.state?.matches({ [AppRootStates.FEATURE]: AppFeatureStates.OBJECT }) ? html`<nde-object-root .actor='${this.actor.children.get(AppActors.OBJECT_MACHINE)}' .logger='${this.logger}' .translator='${this.translator}' @dismiss="${this.dismiss}" @selected-collection="${this.onCollectionSelected}"></nde-object-root>` : '' }
    ${ this.state?.matches({ [AppRootStates.FEATURE]: AppFeatureStates.ABOUT }) ? html`<nde-about-root .actor='${this.actor}' .logger='${this.logger}' .translator='${this.translator}'></nde-about-root>` : '' }
  
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
          overflow: hidden;
          max-height: 100%;
        }
        :host > *:not(nde-sidebar) {
          flex: 1 1;
        }
        nde-progress-bar {
          position: absolute;
          width: 100%;
          top: 0;
          left: 0;
        }
        nde-sidebar {
          width: var(--size-sidebar);
        }

        nde-sidebar nde-content-header {
          cursor: pointer;
        }

        nde-sidebar-item#collections-item {
          margin: var(--gap-normal) 0;
        }

        nde-sidebar-item#search-item {
          margin-top: var(--gap-small);
        }

        nde-sidebar-item div[slot="content"] {
          display: flex;
          flex-direction: column;
        }

        nde-content-header div[slot="icon"] svg {
          fill: var(--colors-foreground-inverse);
        }

        nde-content-header div[slot="title"] {
          height: 100%;
          text-overflow: ellipsis;
          width: 95%;
        }

        div[slot="actions"] svg {
          max-height: var(--gap-normal);
          width: var(--gap-normal);
        }

        .search-title {
          margin-bottom: var(--gap-normal);
        }

        .search-subtitle {
          margin-top: var(--gap-normal);
          font-size: var(--font-size-small);
          cursor: pointer;
        }

        .search-subtitle a {
          text-decoration: underline;
        }

        .search-subtitle svg {
          width: var(--font-size-small);
          height: var(--font-size-small);
          fill: var(--colors-foreground-inverse);
          transform: rotate(90deg);
          position: relative;
          top: 2px;
        }

        div[slot="icon"] svg {
          fill: var(--colors-primary-dark);
        }

        div[slot="content"]{
          padding-bottom: var(--gap-small);
        }

        .cross:hover {
          cursor: pointer;
        }

        nde-sidebar-item:last-of-type {
          flex-direction: column;
          flex: 1 1 auto;
          height: 0px;
        }
      `,
    ];

  }

}
