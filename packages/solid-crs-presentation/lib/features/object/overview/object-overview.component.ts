import { html, property, PropertyValues, internalProperty, unsafeCSS, css, TemplateResult, CSSResult, query } from 'lit-element';
import { Collection, CollectionObject, Logger, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { PopupComponent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { map } from 'rxjs/operators';
import { from } from 'rxjs';
import { Interpreter, State } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { Connect, Identity, Image, Object as ObjectIcon, Theme, Cross, Expand } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { AddAlertEvent } from '../../../app.events';
import { SelectedCollectionEvent } from '../../collection/collection.events';
import { ObjectContext } from '../object.machine';

export class ObjectOverviewComponent extends RxLitElement {

  @property({ type: Object }) public logger: Logger;
  @property({ type: Object }) public translator: Translator;
  @property({ type: Object }) public actor: Interpreter<ObjectContext>;

  @internalProperty() object?: CollectionObject;
  @internalProperty() state?: State<ObjectContext>;
  @internalProperty() collections?: Collection[];

  @query('nde-popup#image-popup') imagePopup: PopupComponent;

  async updated(changed: PropertyValues): Promise<void> {

    super.updated(changed);

    if(changed && changed.has('actor') && this.actor){

      this.subscribe('state', from(this.actor));

      this.subscribe('collections', from(this.actor).pipe(
        map((state) => state.context.collections),
      ));

      this.subscribe('object', from(this.actor).pipe(
        map((state) => state.context?.object),
      ));

    }

  }

  onClickedCopy(value: string): Promise<void> {

    return navigator.clipboard.writeText(value);

  }

  onCollectionClicked(collection: Collection): void {

    this.dispatchEvent(new CustomEvent('selected-collection', { detail: collection }));

  }

  render(): TemplateResult {

    const collection = this.collections?.find((coll) => coll.uri === this.object?.collection);

    const toggleImage = () => { this.imagePopup.toggle(); };

    return this.object ? html`
      <nde-large-card
      .showImage="${false}">
        <div slot="icon">${ unsafeSVG(Image) }</div>
        <div slot="title" class="title">
          ${ this.translator.translate('object.card.image.title') }
        </div>
        <div slot="subtitle" class="subtitle">
          ${ this.translator.translate('object.card.image.subtitle') }
        </div>
        <div slot="content">
          <div class="overlay" @click="${ () => toggleImage() }">
            ${ unsafeSVG(Expand) }
            <img src="${this.object.image}"/>
          </div>
          <div class="object-property" ?hidden="${ !this.object.license || this.object.license?.length < 1 }">
            <div> ${ this.translator.translate('object.card.image.field.license.title') } </div>
            <div> <a target="_blank" rel="noopener noreferrer" href="${this.object.license}">${ this.translator.translate(`object.card.image.field.license.${this.object.license?.split('.').join('-')}`) }</a> </div>
          </div>
          <div class="object-property">
            <div> ${ this.translator.translate('object.card.image.field.image-source') } </div>
            <div class="copy-image-url">
              <a target="_blank" rel="noopener noreferrer" @click="${ () => this.onClickedCopy(this.object?.image).then(() => this.actor.parent.send(new AddAlertEvent({ type: 'success', message: 'common.copied-url' })))}">
              ${ this.translator.translate('object.root.menu.copy-url') }
              </a>
            </div>
          </div>
          <nde-popup dark id="image-popup">
            <div slot="content">
              <div id="dismiss-popup" @click="${ () => toggleImage() }"> ${ unsafeSVG(Cross) } </div>
              <img src="${ this.object.image }"/>
            </div>
          </nde-popup>
        </div>
      </nde-large-card>

      <nde-large-card
      id="identification-card"
      .showImage="${false}">
        <div slot="icon">${ unsafeSVG(Identity) }</div>
        <div slot="title" class="title">
          ${ this.translator.translate('object.card.identification.title') }
        </div>
        <div slot="subtitle" class="subtitle">
          ${ this.translator.translate('object.card.identification.subtitle') }
        </div>
        <div slot="content">
          <div class="object-property" ?hidden="${ !this.object.identifier || this.object.identifier?.length < 1 }">
            <div> ${ this.translator.translate('object.card.identification.field.identifier') } </div>
            <div> ${ this.object.identifier } </div>
          </div>
          <div class="object-property" ?hidden="${ !this.object.additionalType || this.object.additionalType?.length < 1 }">
            <div> ${ this.translator.translate('object.card.identification.field.additionalType') } </div>
            <div> ${ this.object.additionalType?.map((term) => html`<a target="_blank" rel="noopener noreferrer" href="${term.uri}">${term.name}</a>`) } </div>
          </div>
          <div class="object-property" ?hidden="${ !this.object.name || this.object.name?.length < 1 }">
            <div> ${ this.translator.translate('object.card.identification.field.name') } </div>
            <div> ${ this.object.name } </div>
          </div>
          <div class="object-property" ?hidden="${ !this.object.description || this.object.description?.length < 1 }">
            <div> ${ this.translator.translate('object.card.identification.field.description') } </div>
            <div> ${ this.object.description } </div>
          </div>
          <div class="object-property" ?hidden="${ !this.object.collection || this.object.collection?.length < 1 }">
            <div> ${ this.translator.translate('object.card.identification.field.collection') } </div>
            <div> <a id="collection-link" @click="${() => this.onCollectionClicked(collection)}">${ collection?.name }</a>  </div>
          </div>
        </div>
      </nde-large-card>

      <nde-large-card
      ?hidden="${ (!this.object.creator || this.object.creator.length < 1) &&
        (!this.object.locationCreated || this.object.locationCreated.length < 1) &&
        (!this.object.material || this.object.material.length < 1) &&
        !this.object.dateCreated }"
      .showImage="${false}">
        <div slot="icon">${ unsafeSVG(ObjectIcon) }</div>
        <div slot="title" class="title">
          ${ this.translator.translate('object.card.creation.title') }
        </div>
        <div slot="subtitle" class="subtitle">
          ${ this.translator.translate('object.card.creation.subtitle') }
        </div>
        <div slot="content">
          <div class="object-property" ?hidden="${ !this.object.creator || this.object.creator?.length < 1 }">
            <div> ${ this.translator.translate('object.card.creation.field.creator') } </div>
            <div> ${ this.object.creator?.map((term) => html`<a target="_blank" rel="noopener noreferrer" href="${term.uri}">${term.name}</a>`) } </div>
          </div>
          <div class="object-property" ?hidden="${ !this.object.locationCreated || this.object.locationCreated?.length < 1 }">
            <div> ${ this.translator.translate('object.card.creation.field.locationCreated') } </div>
            <div> ${ this.object.locationCreated?.map((term) => html`<a target="_blank" rel="noopener noreferrer" href="${term.uri}">${term.name}</a>`) } </div>
          </div>
          <div class="object-property" ?hidden="${ !this.object.material || this.object.material?.length < 1 }">
            <div> ${ this.translator.translate('object.card.creation.field.material') } </div>
            <div> ${ this.object.material?.map((term) => html`<a target="_blank" rel="noopener noreferrer" href="${term.uri}">${term.name}</a>`) } </div>
          </div>
          <div class="object-property" ?hidden="${ !this.object.dateCreated || this.object.dateCreated?.length < 1 }">
            <div> ${ this.translator.translate('object.card.creation.field.dateCreated') } </div>
            <div> ${ this.object.dateCreated } </div>
          </div>
        </div>
      </nde-large-card>

      <nde-large-card
      ?hidden="${ (!this.object.subject || this.object.subject.length < 1) &&
        (!this.object.location || this.object.location.length < 1) &&
        (!this.object.person || this.object.person.length < 1) &&
        (!this.object.organization || this.object.organization.length < 1) &&
        (!this.object.event || this.object.event.length < 1) }"
      .showImage="${false}">
        <div slot="icon">${ unsafeSVG(ObjectIcon) }</div>
        <div slot="title" class="title">
          ${ this.translator.translate('object.card.representation.title') }
        </div>
        <div slot="subtitle" class="subtitle">
          ${ this.translator.translate('object.card.representation.subtitle') }
        </div>
        <div slot="content">
          <div class="object-property" ?hidden="${ !this.object.subject || this.object.subject?.length < 1 }">
            <div> ${ this.translator.translate('object.card.representation.field.subject') } </div>
            <div> ${ this.object.subject?.map((term) => html`<a target="_blank" rel="noopener noreferrer" href="${term.uri}">${term.name}</a>`) } </div>
          </div>
          <div class="object-property" ?hidden="${ !this.object.location || this.object.location?.length < 1 }">
            <div> ${ this.translator.translate('object.card.representation.field.location') } </div>
            <div> ${ this.object.location?.map((term) => html`<a target="_blank" rel="noopener noreferrer" href="${term.uri}">${term.name}</a>`) } </div>
          </div>
          <div class="object-property" ?hidden="${ !this.object.person || this.object.person?.length < 1 }">
            <div> ${ this.translator.translate('object.card.representation.field.person') } </div>
            <div> ${ this.object.person?.map((term) => html`<a target="_blank" rel="noopener noreferrer" href="${term.uri}">${term.name}</a>`) } </div>
          </div>
          <div class="object-property" ?hidden="${ !this.object.organization || this.object.organization?.length < 1 }">
            <div> ${ this.translator.translate('object.card.representation.field.organization') } </div>
            <div> ${ this.object.organization?.map((term) => html`<a target="_blank" rel="noopener noreferrer" href="${term.uri}">${term.name}</a>`) } </div>
          </div>
          <div class="object-property" ?hidden="${ !this.object.event || this.object.event?.length < 1 }">
            <div> ${ this.translator.translate('object.card.representation.field.event') } </div>
            <div> ${ this.object.event?.map((term) => html`<a target="_blank" rel="noopener noreferrer" href="${term.uri}">${term.name}</a>`) } </div>
          </div>
        </div>
      </nde-large-card>

      <nde-large-card
      ?hidden="${ !this.object.height &&
        !this.object.width &&
        !this.object.depth &&
        !this.object.weight }"
      .showImage="${false}">
        <div slot="icon">${ unsafeSVG(Connect) }</div>
        <div slot="title" class="title">
          ${ this.translator.translate('object.card.dimensions.title') }
        </div>
        <div slot="subtitle" class="subtitle">
          ${ this.translator.translate('object.card.dimensions.subtitle') }
        </div>
        <div slot="content">
          <div class="object-property" ?hidden="${ !this.object.height }">
            <div> ${ this.translator.translate('object.card.dimensions.field.height') } </div>
            <div> ${ this.object.height } ${ this.translator.translate(`common.unit.${this.object.heightUnit}`) } </div>
          </div>
          <div class="object-property" ?hidden="${ !this.object.width }">
            <div> ${ this.translator.translate('object.card.dimensions.field.width') } </div>
            <div> ${ this.object.width } ${ this.translator.translate(`common.unit.${this.object.widthUnit}`) } </div>
          </div>
          <div class="object-property" ?hidden="${ !this.object.depth }">
            <div> ${ this.translator.translate('object.card.dimensions.field.depth') } </div>
            <div> ${ this.object.depth } ${ this.translator.translate(`common.unit.${this.object.depthUnit}`) } </div>
          </div>
          <div class="object-property" ?hidden="${ !this.object.weight }">
            <div> ${ this.translator.translate('object.card.dimensions.field.weight') } </div>
            <div> ${ this.object.weight } ${ this.translator.translate(`common.unit.${this.object.weightUnit}`) } </div>
          </div>
        </div>
      </nde-large-card>
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
        }
        .object-property * {
          overflow: hidden;
          font-size: var(--font-size-small);
          line-height: 21px;
        }
        .object-property > div:first-child {
          font-weight: var(--font-weight-bold);
          width: 33%;
          min-width: 33%;
        }
        .object-property > div:last-child {
          display: inline-flex;
          flex-direction: column;
        }
        .object-property > div:last-child svg {
          fill: var(--colors-primary-light);
        }
        [hidden] {
          display: none;
        }
      `,
    ];

  }

}
