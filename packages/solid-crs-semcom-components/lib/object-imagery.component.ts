import { html, property, unsafeCSS, css, TemplateResult, CSSResult, query } from 'lit-element';
import { CollectionObject, Logger, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { FormEvent, PopupComponent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { SpawnedActorRef } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { Theme, Image, Open, Cross } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';

/**
 * The root page of the object feature.
 */
export class ObjectImageryComponent extends RxLitElement {

  /**
   * The component's logger.
   */
  @property({ type: Object })
  logger?: Logger;

  /**
   * The component's translator.
   */
  @property({ type: Object })
  translator?: Translator;

  /**
   * The object to be displayed and/or edited.
   */
  @property()
  object?: CollectionObject;

  /**
   * The actor responsible for form validation in this component.
   */
  @property()
  formActor?: SpawnedActorRef<FormEvent>;

  /**
   * A list of licenses
   */
  @property()
  licenses: string[] = [
    'http://rightsstatements.org/vocab/InC/1.0/',
    'http://rightsstatements.org/vocab/InC-OW-EU/1.0/',
    'http://rightsstatements.org/vocab/InC-EDU/1.0/',
    'http://rightsstatements.org/vocab/InC-NC/1.0/',
    'http://rightsstatements.org/vocab/InC-RUU/1.0/',
    'http://rightsstatements.org/vocab/NoC-US/1.0/',
    'http://rightsstatements.org/vocab/NoC-OKLR/1.0/',
    'http://rightsstatements.org/vocab/NoC-CR/1.0/',
    'http://rightsstatements.org/vocab/NoC-NC/1.0/',
    'http://rightsstatements.org/vocab/UND/1.0/',
    'http://rightsstatements.org/vocab/CNE/1.0/',
    'http://rightsstatements.org/vocab/NKC/1.0/',
    'https://creativecommons.org/publicdomain/zero/1.0/deed.nl',
    'https://creativecommons.org/licenses/by/4.0/deed.nl',
    'https://creativecommons.org/licenses/by-sa/2.0/be/deed.nl',
  ];

  /**
   * The popup component shown when the image preview is clicked
   */
  @query('nde-popup#image-popup')
  imagePopup: PopupComponent;

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    const toggleImage =  () => { this.imagePopup?.toggle(); };

    return this.object ? html`
        
    <nde-large-card .showImage="${false}">
      <div slot="title">${this.translator?.translate('object.card.image.title')}</div>
      <div slot="subtitle">${this.translator?.translate('object.card.image.subtitle')}</div>
      <div slot="icon">
        ${unsafeSVG(Image)}
      </div>
      <div slot="content">
        <div class="overlay" @click="${ () => toggleImage() }">
            ${ unsafeSVG(Open) }
            <img slot="image" src="${this.object.image}"/>
        </div>
        <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="image">
          <label slot="label" for="image">${this.translator?.translate('object.card.image.field.file.title')}</label>
          <input type="text" slot="input" name="image" id="image"/>
          <div slot="help" for="event">${this.translator?.translate('object.card.image.field.file.description')}</div>
        </nde-form-element>
        <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="license">
          <label slot="label" for="license">${this.translator?.translate('object.card.image.field.license.title')}</label>
          <select slot="input" name="license" id="license">
            ${this.licenses.map((license: string) => html`<option id="${license}" ?selected="${license === this.object?.license}">${this.translator?.translate(`object.card.image.field.license.${license.split('.').join('-')}`)}</option>`)}
          </select>
          <div slot="help" for="event">${this.translator?.translate('object.card.image.field.license.description')}</div>
        </nde-form-element>
        <nde-popup dark id="image-popup">
          <div slot="content">
            <div id="dismiss-popup" @click="${ () => toggleImage() }"> ${ unsafeSVG(Cross) } </div>
            <img src="${ this.object.image }"/>
          </div>
        </nde-popup>
      </div>
    </nde-large-card>
  ` : html``;

  }

  constructor() {

    super();

    if(!customElements.get('nde-popup')) {

      customElements.define('nde-popup', PopupComponent);

    }

  }

  static get styles(): CSSResult[] {

    return [
      unsafeCSS(Theme),
      css`
        nde-large-card div[slot="content"] {
          display: flex;
          flex-direction: column;
          gap: var(--gap-normal);
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
      `,
    ];

  }

}

export default ObjectImageryComponent;
