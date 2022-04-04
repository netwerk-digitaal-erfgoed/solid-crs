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

export class ObjectUpdatesOverviewComponent extends RxLitElement {

  @property() notifications?: ObjectUpdate[];
  @property() translator: Translator;
  @property() actor: Interpreter<ObjectContext>;

  constructor() {

    super();
    define('nde-large-card', LargeCardComponent);

  }

  onChangesAccepted = (): void => {

    // eslint-disable-next-line no-console
    console.log('Accepted Changes (Placeholder log)');

  };

  onChangesRejected = (): void => {

    // eslint-disable-next-line no-console
    console.log('Rejected Changes (Placeholder log)');

  };

  render(): TemplateResult {

    return html`
      ${ this.notifications?.map((noti) => html`
      <nde-large-card .showImage="${false}" .showContent="${false}">
          <div slot="title">${ this.translator?.translate('object.updates.edited-this-object').replace('{{institution}}', noti.from) }</div>
          <div slot="subtitle">
            <a href="#" target="_blank" rel="noopener noreferrer"> ${ this.translator?.translate('object.updates.see-changes') } </a>
          </div>
          <div slot="icon"> ${unsafeSVG(Open)} </div>
          <div slot="actions" class="accept" @click="${this.onChangesAccepted}"> ${unsafeSVG(CheckCircle)} </div>
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