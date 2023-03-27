import { html, property, PropertyValues, internalProperty, unsafeCSS, css, TemplateResult, CSSResult, query } from 'lit-element';
import { CollectionObject, Logger, Term, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { PopupComponent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { map } from 'rxjs/operators';
import { from } from 'rxjs';
import { Interpreter, State } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { Connect, Identity, Image, Object as ObjectIcon, Theme, Cross, Expand } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { AddAlertEvent } from '../../../app.events';
import { ObjectContext } from '../object.machine';

export class ObjectCompareComponent extends RxLitElement {

  @property({ type: Object }) public logger: Logger;
  @property({ type: Object }) public translator: Translator;
  @property({ type: Object }) public actor: Interpreter<ObjectContext>;

  @internalProperty() object?: CollectionObject;
  @internalProperty() updatedObject?: CollectionObject;
  @internalProperty() state?: State<ObjectContext>;

  @query('nde-popup#image-popup') imagePopup: PopupComponent;

  async updated(changed: PropertyValues): Promise<void> {

    super.updated(changed);

    if(changed && changed.has('actor') && this.actor){

      this.subscribe('state', from(this.actor));

      this.subscribe('object', from(this.actor).pipe(
        map((state) => state.context?.object),
      ));

      this.subscribe('updatedObject', from(this.actor).pipe(
        map((state) => state.context?.updatedObject),
      ));

    }

  }

  onClickedCopy(value: string): Promise<void> {

    return navigator.clipboard.writeText(value);

  }

  render(): TemplateResult {

    const renderTermsListProperty = (category: string, field: string) => html`
      ${ (JSON.stringify((this.updatedObject as any)[field]) !== JSON.stringify((this.object as any)[field])) ? html`
        <div class="object-property">
          <div> ${ this.translator?.translate(`object.card.${category}.field.${field}`) } </div>
          <div> ${ (this.object as any)[field]?.map((term: Term) => html`<a target="_blank" rel="noopener noreferrer" href="${term.uri}">${term.name}</a>`) } </div>
          <div>
            ${ (this.updatedObject as any)[field]?.length ? html`
                ${ (this.updatedObject as any)[field]?.map((term: Term) => html`<a target="_blank" rel="noopener noreferrer" href="${term.uri}">${term.name}</a>`) }
            ` : this.translator?.translate('object.card.common.removed')}
          </div>
        </div>
      ` : ''}
    `;

    const renderStringProperty = (category: string, field: string) => html`
      ${ ((this.object as any)[field] !== (this.updatedObject as any)[field]) ? html`
        <div class="object-property">
          <div> ${ this.translator?.translate(`object.card.${category}.field.${field}`) } </div>
          <div> ${ (this.object as any)[field] } </div>
          <div>
            ${ (this.updatedObject as any)[field] ? html`
              ${ (this.updatedObject as any)[field] }
            ` : this.translator?.translate('object.card.common.removed')}
          </div>
        </div>
      ` : ''}
    `;

    const renderUnitNumberProperty = (category: string, field: string) => html`
      ${ ((this.object as any)[field] !== (this.updatedObject as any)[field]) ? html`
        <div class="object-property">
          <div> ${ this.translator?.translate(`object.card.${category}.field.${field}`) } </div>
          <div>
            ${(this.object as any)[field] ? html`
              ${ (this.object as any)[field] } ${ this.translator?.translate(`common.unit.${(this.object as any)[`${field}Unit`]}`) }
            ` : ''} 
          </div>
          <div>
            ${ `${(this.updatedObject as any)[field]} ${this.translator?.translate(`common.unit.${(this.updatedObject as any)[`${field}Unit`]}`) }` }
          </div>
        </div>
      ` : ''}
    `;

    const toggleImage = () => { this.imagePopup.toggle(); };

    return this.object && this.updatedObject ? html`

      ${this.object.license !== this.updatedObject.license ||
        this.object.image !== this.updatedObject.image ? html`

          <nde-large-card .showImage="${false}">
            <div slot="icon">${ unsafeSVG(Image) }</div>
            <div slot="title" class="title">
              ${ this.translator?.translate('object.card.image.title') }
            </div>
            <div slot="subtitle" class="subtitle">
              ${ this.translator?.translate('object.card.image.subtitle') }
            </div>
            <div slot="content">
              <div class="overlay" @click="${ () => toggleImage() }" ?hidden="${ this.object.image === this.updatedObject.image }">
                ${ unsafeSVG(Expand) }
                <img src="${this.updatedObject.image}"/>
              </div>
              <div class="object-property" ?hidden="${ this.object.license === this.updatedObject.license }">
                <div> ${ this.translator?.translate('object.card.image.field.license.title') } </div>
                <div> <a target="_blank" rel="noopener noreferrer" href="${this.object.license}">${ this.translator.translate(`object.card.image.field.license.${this.object.license?.split('.').join('-')}`) }</a> </div>
                <div>
                  ${ this.updatedObject.license ? html`
                    <a target="_blank" rel="noopener noreferrer" href="${this.updatedObject.license}">
                      ${ this.translator?.translate(`object.card.image.field.license.${this.updatedObject.license?.split('.').join('-')}`) }
                    </a>
                  ` : this.translator?.translate('object.card.common.removed')}
                </div>
              </div>
              <div class="object-property" ?hidden="${ this.object.image === this.updatedObject.image }">
                <div> ${ this.translator?.translate('object.card.image.field.image-source') } </div>
                <div class="copy-image-url">
                  <a target="_blank" rel="noopener noreferrer" @click="${ () => this.onClickedCopy(this.object.image).then(() => this.actor.parent.send(new AddAlertEvent({ type: 'success', message: 'common.copied-url' })))}">
                    ${ this.translator?.translate('object.root.menu.copy-url') }
                  </a>
                </div>
                <div class="copy-image-url">
                  ${ this.updatedObject.image ? html`
                    <a target="_blank" rel="noopener noreferrer"
                      @click="${ () => this.onClickedCopy(this.updatedObject.image).then(() => this.actor.parent.send(new AddAlertEvent({ type: 'success', message: 'common.copied-url' })))}"
                    >
                      ${ this.translator?.translate('object.root.menu.copy-url') }
                    </a>
                  ` : this.translator?.translate('object.card.common.removed')}
                </div>
              </div>
              <nde-popup dark id="image-popup">
                <div slot="content">
                  <div id="dismiss-popup" @click="${ () => toggleImage() }"> ${ unsafeSVG(Cross) } </div>
                  <img src="${ this.updatedObject.image }"/>
                </div>
              </nde-popup>
            </div>
          </nde-large-card>

      ` : ''}


      ${this.object.identifier !== this.updatedObject.identifier ||
        JSON.stringify(this.object.additionalType) !== JSON.stringify(this.updatedObject.additionalType) ||
        this.object.name !== this.updatedObject.name ||
        this.object.description !== this.updatedObject.description ||
        this.object.collection !== this.updatedObject.collection ? html`

          <nde-large-card id="identification-card" .showImage="${false}">
            <div slot="icon">${ unsafeSVG(Identity) }</div>
            <div slot="title" class="title">
              ${ this.translator.translate('object.card.identification.title') }
            </div>
            <div slot="subtitle" class="subtitle">
              ${ this.translator.translate('object.card.identification.subtitle') }
            </div>
            <div slot="content">
              ${renderStringProperty('identification', 'identifier')}
              ${renderTermsListProperty('identification', 'additionalType')}
              ${renderStringProperty('identification', 'name')}
              ${renderStringProperty('identification', 'description')}
              <div class="object-property" ?hidden="${ (this.object.collection === this.updatedObject.collection) }">
                <div> ${ this.translator?.translate('object.card.identification.field.collection') } </div>
                <div> <a target="_blank" href="${this.object.collection }"> ${ this.object.collection } </a> </div>
                <div>
                  ${ this.updatedObject.collection ? html`
                    <a target="_blank" href="${this.updatedObject.collection }"> ${ this.updatedObject.collection } </a> 
                  ` : this.translator?.translate('object.card.common.removed')}
                </div>
              </div>
            </div>
          </nde-large-card>

      ` : ''}


      ${JSON.stringify(this.object.creator) !== JSON.stringify(this.updatedObject.creator) ||
        JSON.stringify(this.object.locationCreated) !== JSON.stringify(this.updatedObject.locationCreated) ||
        JSON.stringify(this.object.material) !== JSON.stringify(this.updatedObject.material) ||
        this.object.dateCreated !== this.updatedObject.dateCreated ? html`

          <nde-large-card .showImage="${false}">
            <div slot="icon">${ unsafeSVG(ObjectIcon) }</div>
            <div slot="title" class="title">
              ${ this.translator.translate('object.card.creation.title') }
            </div>
            <div slot="subtitle" class="subtitle">
              ${ this.translator.translate('object.card.creation.subtitle') }
            </div>
            <div slot="content">
              ${renderTermsListProperty('creation', 'creator')}
              ${renderTermsListProperty('creation', 'locationCreated')}
              ${renderTermsListProperty('creation', 'material')}
              ${renderStringProperty('creation', 'dateCreated')}
            </div>
          </nde-large-card>

      ` : ''}
      
      ${JSON.stringify(this.object.subject) !== JSON.stringify(this.updatedObject.subject) ||
        JSON.stringify(this.object.location) !== JSON.stringify(this.updatedObject.location) ||
        JSON.stringify(this.object.person) !== JSON.stringify(this.updatedObject.person) ||
        JSON.stringify(this.object.organization) !== JSON.stringify(this.updatedObject.organization) ||
        JSON.stringify(this.object.event) !== JSON.stringify(this.updatedObject.event) ? html`

          <nde-large-card .showImage="${false}">
            <div slot="icon">${ unsafeSVG(ObjectIcon) }</div>
            <div slot="title" class="title">
              ${ this.translator.translate('object.card.representation.title') }
            </div>
            <div slot="subtitle" class="subtitle">
              ${ this.translator.translate('object.card.representation.subtitle') }
            </div>
            <div slot="content"> 
              ${renderTermsListProperty('representation', 'subject')}
              ${renderTermsListProperty('representation', 'location')}
              ${renderTermsListProperty('representation', 'person')}
              ${renderTermsListProperty('representation', 'organization')}
              ${renderTermsListProperty('representation', 'event')}
            </div>
          </nde-large-card>

      ` : ''}

      ${this.object.height !== this.updatedObject.height ||
        this.object.width !== this.updatedObject.width ||
        this.object.depth !== this.updatedObject.depth ||
        this.object.weight !== this.updatedObject.weight ? html`
        
          <nde-large-card .showImage="${false}">
            <div slot="icon">${ unsafeSVG(Connect) }</div>
            <div slot="title" class="title">
              ${ this.translator.translate('object.card.dimensions.title') }
            </div>
            <div slot="subtitle" class="subtitle">
              ${ this.translator.translate('object.card.dimensions.subtitle') }
            </div>
            <div slot="content">
              ${renderUnitNumberProperty('dimensions', 'height')}
              ${renderUnitNumberProperty('dimensions', 'width')}
              ${renderUnitNumberProperty('dimensions', 'depth')}
              ${renderUnitNumberProperty('dimensions', 'weight')}
            </div>
          </nde-large-card>

      ` : ''}

    ` : html``;

  }

  static get styles(): CSSResult[] {

    return [
      unsafeCSS(Theme),
      css`
        :host {
          display: flex;
          flex-direction: column;
        }
        nde-large-card div[slot="content"] {
          margin: 0 45px; /* gap-large + gap-small */
        }
        nde-large-card .overlay {
          position: relative;
          cursor: pointer;
          height: 200px;
          width: 100%;
          display: block;
          margin-bottom: var(--gap-normal);
        }
        nde-large-card .overlay svg {
          position: absolute;
          top: var(--gap-small);
          right: var(--gap-small);
          fill: white;
        }
        nde-large-card .overlay img {
          display: block;
          height: 200px;
          width: 100%;
          object-fit: cover;
        }
        #image-popup div[slot="content"] {
          max-height: 90%;
          width: 90%;
          display: flex;
          flex-direction: column;
          gap: var(--gap-normal);
        }
        #image-popup div[slot="content"] img {
          max-height: 95%;
          object-fit: scale-down;
        }
        #image-popup div[slot="content"] div {
          fill: white;
          height: 20px;
          width: 20px;
          align-self: flex-end;
          cursor: pointer;
        }
        a {
          cursor: pointer;
          text-decoration: underline;
          color: var(--colors-primary-light);
        }
        .object-property {
          margin-bottom: var(--gap-small);
          width: 100%;
          display: flex;
          justify-content: space-between;
        }
        .object-property * {
          overflow: hidden;
          font-size: var(--font-size-small);
          line-height: 21px;
        }
        .object-property > div:first-child {
          font-weight: var(--font-weight-bold);
        }
        .object-property > div {
          width: 31%;
          min-width: 31%;
        }
        .object-property > div:not(:first-child) {
          display: inline-flex;
          flex-direction: column;
        }
        .object-property > div:not(:first-child) svg {
          fill: var(--colors-primary-light);
        }
        [hidden] {
          display: none;
        }
      `,
    ];

  }

}
