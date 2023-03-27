import { html, property, PropertyValues, internalProperty, unsafeCSS, css, TemplateResult, CSSResult, query } from 'lit-element';
import { ArgumentError, Collection, CollectionObject, Logger, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { Alert, PopupComponent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { map } from 'rxjs/operators';
import { from } from 'rxjs';
import { Interpreter, State } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { Dots, Object as ObjectIcon, Theme } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { fetch as solidFetch } from '@netwerk-digitaal-erfgoed/solid-crs-client';
import { AddAlertEvent, DismissAlertEvent } from '../../app.events';
import { ObjectContext, ObjectStates } from './object.machine';

/**
 * The root page of the object feature.
 */
export class ObjectRootComponent extends RxLitElement {

  @property({ type: Object }) public logger: Logger;
  @property({ type: Object }) public translator: Translator;
  @property({ type: Object }) public actor: Interpreter<ObjectContext>;

  @internalProperty() public alerts: Alert[];
  @internalProperty() state?: State<ObjectContext>;
  @internalProperty() collections?: Collection[];
  @internalProperty() object?: CollectionObject;

  @query('nde-popup#info-popup') infoPopup: PopupComponent;

  async updated(changed: PropertyValues): Promise<void> {

    super.updated(changed);

    if(changed && changed.has('actor') && this.actor){

      if(this.actor.parent){

        this.subscribe('alerts', from(this.actor.parent)
          .pipe(map((state) => state.context?.alerts)));

      }

      this.subscribe('state', from(this.actor));

      this.subscribe('collections', from(this.actor).pipe(
        map((state) => state.context.collections),
      ));

      this.subscribe('object', from(this.actor).pipe(
        map((state) => state.context?.object),
      ));

    }

  }

  handleDismiss(event: CustomEvent<Alert>): void {

    this.dispatchEvent(new CustomEvent('dismiss', { detail: event.detail }));

  }

  onClickedCopy(value: string): Promise<void> {

    return navigator.clipboard.writeText(value);

  }

  onCollectionSelected = (customEvent: CustomEvent): void => {

    this.dispatchEvent(new CustomEvent('selected-collection', { detail: customEvent.detail }));

  };

  downloadRDF = async (): Promise<void> => await solidFetch(this.object?.uri)
    .then((response) => response.blob())
    .then((blob) => {

      const blobURL = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobURL;
      const slashSplit = this.object?.uri.split('/');
      a.download = `${slashSplit[slashSplit.length - 1]}.ttl`;
      (a as any).style = 'display: none';
      document.body.appendChild(a);
      a.click();

    });

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    // Create an alert components for each alert.
    const alerts = this.alerts?.map((alert) => html`<nde-alert .logger='${this.logger}' .translator='${this.translator}' .alert='${alert}' @dismiss="${this.handleDismiss}"></nde-alert>`);

    const toggleInfo = () => { this.infoPopup.toggle(); };

    return this.object ? html`
      <nde-content-header inverse>
        <div slot="icon">${ unsafeSVG(ObjectIcon) }</div>
        <div slot="title" class="title">
          ${ this.object.name}
        </div>
        <div slot="subtitle" class="subtitle">
          ${ this.object.description }
        </div>
        ${ this.state?.matches(ObjectStates.OVERVIEW) ? html`
        <div slot="actions">
          <div @click="${() => toggleInfo()}">
            ${ unsafeSVG(Dots) }
            <nde-popup id="info-popup">
              <div slot="content">
                <a @click="${this.downloadRDF}" class="download-rdf">
                  ${this.translator.translate('object.root.menu.view-rdf')}
                </a>
                <a @click="${() => this.onClickedCopy(this.object?.uri).then(() => this.actor.parent.send(new AddAlertEvent({ type: 'success', message: 'common.copied-uri' })))}">
                  ${this.translator.translate('object.root.menu.copy-uri')}
                </a>
              </div>
            </nde-popup>
          </div>
        </div>
        ` : ''}
      </nde-content-header>

      <div class="content">

        ${ alerts }
        ${ this.state?.matches(ObjectStates.OVERVIEW) ? html`
          <nde-object-overview
            .actor='${this.actor}'
            .logger='${this.logger}'
            .translator='${this.translator}'
            @selected-collection="${this.onCollectionSelected}"
          ></nde-object-overview>` : ''}
        ${ this.state?.matches(ObjectStates.COMPARE) ? html`
          <nde-object-compare
            .actor='${this.actor}'
            .logger='${this.logger}'
            .translator='${this.translator}'
          ></nde-object-compare>` : ''}

      </div>
    ` : html`<nde-progress-bar></nde-progress-bar>`;

  }

  static get styles(): CSSResult[] {

    return [
      unsafeCSS(Theme),
      css`
        :host {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        nde-content-header {
          z-index: 1;
        }
        nde-alert {
          z-index: unset;
        }
        #info-popup {
          z-index: 110;
          height: auto;
          width: auto;
          position: absolute;
          left: unset;
          right: var(--gap-normal);
          top: var(--gap-huge);
          background-color: var(--colors-background-light);
          /* box-shadow: 0 0 5px grey; */
          border: 1px var(--colors-foreground-normal) solid;
        }
        #info-popup div {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        #info-popup a {
          padding: var(--gap-small);
          color: var(--colors-primary-normal);
          text-decoration: none;
          /* text-align: center; */
        }
        #info-popup a:hover {
          background-color: var(--colors-primary-normal);
          color: var(--colors-background-light);
        }
        .content {
          padding: var(--gap-large);
          width: calc(100% - (2 * var(--gap-large)));
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        a {
          cursor: pointer;
          text-decoration: underline;
          color: var(--colors-primary-light);
        }
        [hidden] {
          display: none;
        }
      `,
    ];

  }

}
