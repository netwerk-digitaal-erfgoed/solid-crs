import { html, property, unsafeCSS, css, TemplateResult, CSSResult } from 'lit-element';
import { CollectionObject, Logger, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { FormEvent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { ActorRef } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { Theme, Object as ObjectIcon } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';

export class ObjectLoanComponent extends RxLitElement {

  @property({ type: Object }) translator?: Translator;
  @property({ type: Object }) logger?: Logger;
  @property() object?: CollectionObject;
  @property() formActor?: ActorRef<FormEvent>;
  @property() isOwner = true;

  render(): TemplateResult {

    return this.object ? html`

    <nde-large-card .showImage="${false}" .showContent="${this.isOwner}">
      <div slot="title">${this.translator?.translate('object.card.loan.title')}</div>
      ${ this.isOwner ? html`
        <div slot="subtitle">${this.translator?.translate('object.card.loan.subtitle.owner')}</div>
        ` : html`
        <div slot="subtitle">
          ${unsafeHTML(this.translator?.translate('object.card.loan.subtitle.lender').replace('{{href}}', '#').replace('{{institution}}', 'Placeholder'))}
        </div>
      `}
      <div slot="icon">
        ${unsafeSVG(ObjectIcon)}
      </div>
      ${ this.isOwner ? html` 
        <div slot="content">
          <p>
            ${unsafeHTML(this.translator?.translate('object.card.loan.content.borrower').replace('{{href}}', '#').replace('{{institution}}', 'Placeholder'))}
          </p>
          <a href="#" target="_blank"> ${this.translator?.translate('object.card.loan.content.see-changes')} </a>
        </div>
      ` : ''}
    </nde-large-card>
  ` : html``;

  }

  static get styles(): CSSResult[] {

    return [
      unsafeCSS(Theme),
      css`
        a {
          color: var(--colors-primary-light);
        }
      `,
    ];

  }

}

export default ObjectLoanComponent;
