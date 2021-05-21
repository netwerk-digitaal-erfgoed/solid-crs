import { html, property, PropertyValues, internalProperty, unsafeCSS, css, CSSResult, TemplateResult } from 'lit-element';
import { ActorRef, interpret, State } from 'xstate';
import { from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ArgumentError, Collection, ConsoleLogger, Logger, LoggerLevel, MemoryTranslator, Translator } from '@digita-ai/nde-erfgoed-core';
import { Alert, FormActors, FormCleanlinessStates, FormEvent, FormRootStates, FormSubmissionStates, FormValidationStates } from '@digita-ai/nde-erfgoed-components';
import { RxLitElement } from 'rx-lit';
import { Theme, Logout, Logo, Plus, Cross, Search } from '@digita-ai/nde-erfgoed-theme';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { AppActors, AppAuthenticateStates, AppContext, AppFeatureStates, appMachine, AppRootStates } from './app.machine';
import nlNL from './i8n/nl-NL.json';
import { AppEvents } from './app.events';
import { SolidSDKService } from './common/solid/solid-sdk.service';
import { CollectionEvents, SelectedCollectionEvent } from './features/collection/collection.events';
import { SolidProfile } from './common/solid/solid-profile';
import { CollectionSolidStore } from './common/solid/collection-solid-store';
import { CollectionObjectSolidStore } from './common/solid/collection-object-solid-store';
import { SearchEvents } from './features/search/search.events';

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
      new CollectionSolidStore(),
      new CollectionObjectSolidStore(),
      {
        uri: null,
        name: this.translator.translate('nde.features.collections.new-collection-name'),
        description: this.translator.translate('nde.features.collections.new-collection-description'),
        objectsUri: undefined,
        distribution: undefined,
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

  @internalProperty()
  helper: any;

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

  firstUpdated(changed: PropertyValues): void {

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

  }

  /**
   * Hook called after first update after connection to the DOM.
   * It subscribes to the actor, logs state changes, and pipes state to the properties.
   */
  updated(changed: PropertyValues): void {

    if(changed.has('formActor') && this.formActor){

      this.subscribe('helper', from(this.formActor).pipe(
        map((state) => state.matches({
          [FormSubmissionStates.NOT_SUBMITTED]:{
            [FormRootStates.CLEANLINESS]: FormCleanlinessStates.DIRTY,
            [FormRootStates.VALIDATION]: FormValidationStates.VALID,
          },
        })),
        tap((matches) => matches
          ? this.actor.send(SearchEvents.SEARCH_UPDATED, { searchTerm: this.searchTerm })
          : null),
      ));

    }

  }

  searchUpdated(event: KeyboardEvent): void{

    this.searchTerm = (event.target as HTMLInputElement).value;

  }

  clearSearchTerm(): void {

    this.searchTerm = '';

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
      <nde-sidebar-item>
        <div slot="content">
          <div class="search-title"> ${this.translator?.translate('nde.navigation.search.title')} </div>
          <nde-form-element .inverse="${true}" .submitOnEnter="${false}" .showLabel="${false}" .actor="${this.formActor}" .translator="${this.translator}" field="searchTerm">
            <input type="text"
              slot="input"
              .value="${this.searchTerm}"
              class="searchTerm"
              @input="${(event: Event) => this.searchTerm = (event.target as HTMLInputElement).value}"
            />
            ${this.searchTerm
    ? html`<div class="cross" slot="icon" @click="${() => { this.searchTerm = ''; this.actor.send({ type: CollectionEvents.SELECTED_COLLECTION, collection: this.collections[0] } as SelectedCollectionEvent); }}">${ unsafeSVG(Cross) }</div>`
    : html`<div slot="icon">${ unsafeSVG(Search) }</div>`
}
          </nde-form-element>
        </div>
      </nde-sidebar-item>
      <nde-sidebar-item .padding="${false}" .showBorder="${false}">
        <nde-sidebar-list slot="content">
          <nde-sidebar-list-item slot="title" isTitle inverse>
            <div slot="title">${this.translator?.translate('nde.navigation.collections.title')}</div>
            <div slot="actions" @click="${() => this.actor.send(AppEvents.CLICKED_CREATE_COLLECTION)}">${ unsafeSVG(Plus) }</div>
          </nde-sidebar-list-item>
          ${this.collections?.map((collection) => html`<nde-sidebar-list-item slot="item" inverse ?selected="${ collection.uri === this.selected?.uri}" @click="${() => this.actor.send(CollectionEvents.SELECTED_COLLECTION, { collection })}"><div slot="title">${collection.name}</div></nde-sidebar-list-item>`)}
        </nde-sidebar-list>
      </nde-sidebar-item>
    </nde-sidebar>
    ` : '' }  
    ${ this.state?.matches({ [AppRootStates.FEATURE]: AppFeatureStates.AUTHENTICATE }) ? html`<nde-authenticate-root .actor='${this.actor.children.get(AppActors.AUTHENTICATE_MACHINE)}' .logger='${this.logger}' .translator='${this.translator}'></nde-authenticate-root>` : '' }  
    ${ this.state?.matches({ [AppRootStates.FEATURE]: AppFeatureStates.COLLECTION }) ? html`<nde-collection-root .actor='${this.actor.children.get(AppActors.COLLECTION_MACHINE)}' .showDelete='${this.collections?.length > 1}' .logger='${this.logger}' .translator='${this.translator}'></nde-collection-root>` : '' }  
    ${ this.state?.matches({ [AppRootStates.FEATURE]: AppFeatureStates.SEARCH }) ? html`<nde-search-root .actor='${this.actor.children.get(AppActors.SEARCH_MACHINE)}' .logger='${this.logger}' .translator='${this.translator}'></nde-search-root>` : '' }  
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

        :host > * {
          flex: 1 1;
        }

        :host nde-sidebar {
          flex: 0 0 var(--size-sidebar);
        }

        nde-sidebar {
          max-height: inherit;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        nde-content-header div[slot="icon"] svg {
          fill: var(--colors-foreground-inverse);
        }

        div[slot="actions"] svg {
          max-height: var(--gap-normal);
          width: var(--gap-normal);
        }

        .search-title {
          padding-bottom: var(--gap-normal);
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
