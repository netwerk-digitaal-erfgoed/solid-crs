import { html, property, unsafeCSS, css, TemplateResult, CSSResult } from 'lit-element';
import { Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { Interpreter } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { CheckCircle, CrossCircle, Open, Theme } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { LargeCardComponent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { define } from '@digita-ai/dgt-components';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { ObjectUpdate } from '../models/object-update.model';
import { ObjectContext } from '../object.machine';
import { ClickedImportUpdates, ClickedObjectSidebarItem } from '../object.events';

export class ObjectUpdatesOverviewComponent extends RxLitElement {

  @property() notifications?: ObjectUpdate[];
  @property() translator: Translator;
  @property() actor: Interpreter<ObjectContext>;

  constructor() {

    super();
    define('nde-large-card', LargeCardComponent);

  }

  onChangesAccepted = (collectionUri: string): void => {

    // eslint-disable-next-line no-console
    this.actor.send(new ClickedImportUpdates(collectionUri));

  };

  onChangesRejected = (): void => {

    // eslint-disable-next-line no-console
    console.debug('Rejected Changes');

    this.actor.send(new ClickedObjectSidebarItem('object.sidebar.identification'));

  };

  render(): TemplateResult {

    return html`
      ${ this.notifications?.map((notification) => html`
      <nde-large-card .showImage="${false}" .showContent="${false}">
          <div slot="title">${ this.translator?.translate('object.updates.edited-this-object').replace('{{institution}}', notification.from) }</div>
          <div slot="subtitle">
            <a href="${process.env.VITE_PRESENTATION_URI}${encodeURIComponent(notification.from)}/object/${encodeURIComponent(notification.updatedObject)}/compare/${encodeURIComponent(notification.originalObject)}" target="_blank" rel="noopener noreferrer">
              ${ this.translator?.translate('object.updates.see-changes') }
            </a>
          </div>
          <div slot="icon"> ${unsafeSVG(Open)} </div>
          <div slot="actions" class="accept" @click="${() => this.onChangesAccepted(notification.originalObject)}"> ${unsafeSVG(CheckCircle)} </div>
          <div slot="actions" class="reject" @click="${this.onChangesRejected}"> ${unsafeSVG(CrossCircle)} </div>
        </nde-large-card>
      `)}
    `;

  }

  static get styles(): CSSResult[] {

    return [
      unsafeCSS(Theme),
      css`
        :host {
          display: flex;
          flex-direction: column;
          gap: var(--gap-large);
        }
        div[slot="subtitle"] a {
          color: var(--colors-primary-light);
          text-underline-offset: 2px;
        }
      `,
    ];

  }

}
