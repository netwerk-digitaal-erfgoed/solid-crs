import { html, property, PropertyValues, internalProperty, unsafeCSS, css, TemplateResult, CSSResult } from 'lit-element';
import { ArgumentError, Collection, Logger, SolidProfile, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { Dropdown, Object as ObjectIcon, Theme } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { Alert } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { map } from 'rxjs/operators';
import { from } from 'rxjs';
import { Interpreter, State } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { DismissAlertEvent } from '../../app.events';
import { AppContext } from '../../app.machine';
import { SelectedCollectionEvent } from '../collection/collection.events';

/**
 * The root page of the search feature.
 */
export class AboutRootComponent extends RxLitElement {

  /**
   * The component's logger.
   */
  @property({ type: Object })
  public logger: Logger;

  /**
   * The component's translator.
   */
  @property({ type: Object })
  public translator: Translator;

  /**
   * The actor controlling this component.
   */
  @property({ type: Object })
  public actor: Interpreter<AppContext>;

  /**
   * The component's alerts.
   */
  @property({ type: Array })
  public alerts: Alert[];

  /**
   * The state of this component.
   */
  @internalProperty()
  state?: State<AppContext>;

  /**
   * The collections that match the searched term.
   */
  @internalProperty()
  collections?: Collection[];

  /**
   * The profile of the heritage institution.
   */
  @internalProperty()
  profile?: SolidProfile;

  /**
   * Hook called on at every update after connection to the DOM.
   */
  updated(changed: PropertyValues): void {

    super.updated(changed);

    if(changed && changed.has('actor') && this.actor){

      this.subscribe('alerts', from(this.actor)
        .pipe(map((state) => state.context?.alerts)));

      this.subscribe('state', from(this.actor));

      this.subscribe('collections', from(this.actor)
        .pipe(map((state) => state.context?.collections)));

      this.subscribe('profile', from(this.actor)
        .pipe(map((state) => state.context?.profile)));

    }

  }

  /**
   * Handles a dismiss event by sending a dismiss alert event to its parent.
   *
   * @param event Dismiss event dispatched by an alert componet.
   */
  handleDismiss(event: CustomEvent<Alert>): void {

    if (!event || !event.detail) {

      throw new ArgumentError('Argument event || event.detail should be set.', event);

    }

    if (!this.actor) {

      throw new ArgumentError('Argument this.actor should be set.', this.actor);

    }

    this.actor.send(new DismissAlertEvent(event.detail));

  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    const alerts = this.alerts?.map((alert) => html`<nde-alert .logger='${this.logger}' .translator='${this.translator}' .alert='${alert}' @dismiss="${this.handleDismiss}"></nde-alert>`);

    return html`
      <nde-content-header inverse>
        <div slot="icon">${ unsafeSVG(ObjectIcon) }</div>
        <div slot="title">${this.translator?.translate('nde.features.about.header.title')}</div>
        <div slot="subtitle">${this.translator?.translate('nde.features.about.header.subtitle')}</div>
      </nde-content-header>

      <div class="content">
            
        ${ alerts }

        <nde-large-card
        .showImage="${false}"
        .showHeader="${false}">
          <div slot="content">

            <p>${ this.profile?.name }</p>
            ${ this.profile?.description ? html`<p>${ this.profile?.description }</p>` : ''}
            <div class="links">
              
              ${ this.profile?.website ? html`<a target="_blank" href="${this.profile?.website}">${this.translator.translate('nde.features.about.more-information')}</a>` : ''}
              ${ this.profile?.email ? html`<span>E-mail: <a href="mailto:${this.profile?.email}">${this.profile?.email}</a></span>` : ''}
              ${ this.profile?.telephone ? html`<span>Tel: <a href="tel:${this.profile?.telephone}">${this.profile?.telephone}</a></span>` : ''}
              
            </div>
          </div>
        </nde-large-card> 

        <span>${this.translator?.translate('nde.features.about.collection-overview')}</span>

        ${this.collections?.map((collection) => html`
        <nde-large-card
        class="collection"
        @click="${() => this.actor.send(new SelectedCollectionEvent(collection))}"
        .showImage="${false}"
        .showContent="${false}">
          <div slot="title">${ collection.name }</div>
          <div slot="actions">${ unsafeSVG(Dropdown) }</div>
        </nde-large-card>
        `) }
      </div>
    `;

  }

  /**
   * The styles associated with the component.
   */
  static get styles(): CSSResult[] {

    return [
      unsafeCSS(Theme),
      css`

        *::-webkit-scrollbar-thumb {
          background-color: var(--colors-foreground-light);
          border: 3px solid var(--colors-background-normal);
        }
        *::-webkit-scrollbar-track {
          background: var(--colors-background-normal);
        }
        :host {
          scrollbar-color: var(--colors-foreground-light) var(--colors-background-normal);
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .content {
          margin: 0 var(--gap-large);
          margin-top: 41px;
          height: 100%;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        .content > * {
          margin-bottom: var(--gap-large);
        }
        .content p {
          margin: var(--gap-large) 0;
        }
        .content p:first-of-type {
          margin: var(--gap-normal) 0;
          font-weight: var(--font-weight-bold);
        }
        .content a {
          cursor: pointer;
          text-decoration: underline;
          color: var(--colors-primary-light);
        }
        .links {
          display: flex;
          flex-direction: column;
        }
        .links > * {
          margin-bottom: var(--gap-small);
        }
        .links :first-child {
          margin-bottom: var(--gap-large);
        }
        .collection {
          cursor: pointer;
        }
        .collection svg {
          transform: rotate(-90deg);
        }
      `,
    ];

  }

}
