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

  render(): TemplateResult {

    const isOwner = this.object && !this.object.original;
    const hasLoanedObjects = this.object && this.object.loaned && this.object.loaned.length > 0;

    return this.object ? html`

    <nde-large-card .showImage="${false}" .showContent="${(isOwner && hasLoanedObjects) || !isOwner}">
      <div slot="title">${this.translator?.translate('object.card.loan.title')}</div>
      ${ isOwner ? html`
        <div slot="subtitle">${this.translator?.translate('object.card.loan.subtitle.loaned-object')}</div>
        ` : html`
        <div slot="subtitle">
        ${ this.object.original ? unsafeHTML(this.translator?.translate('object.card.loan.subtitle.lender').replace('{{href}}', this.object.original).replace('{{institution}}', 'Placeholder')) : ''}
        </div>
      `}
      <div slot="icon">
        ${unsafeSVG(ObjectIcon)}
      </div>
      ${ isOwner ? html` 
        <div slot="content">
          <p>
            ${unsafeHTML(this.translator?.translate('object.card.loan.content.borrower').replace('{{href}}', '#').replace('{{institution}}', 'Placeholder'))}
          </p>
          ${ this.object.loaned?.map((loaned) => html`
            <a href="${loaned}" target="_blank"> ${this.translator?.translate('object.card.loan.content.see-changes')} </a>
          `)}
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
