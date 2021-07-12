import { html, property, unsafeCSS, css, TemplateResult, CSSResult } from 'lit-element';
import { Collection, CollectionObject, Logger, Translator, Term } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { FormEvent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { SpawnedActorRef } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { Theme, Identity, Connect } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';

/**
 * The root page of the object feature.
 */
export class ObjectIdentificationComponent extends RxLitElement {

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
   * The object to be displayed and/or edited.
   */
  @property()
  object?: CollectionObject;

  /**
   * The actor responsible for form validation in this component.
   */
  @property()
  formActor: SpawnedActorRef<FormEvent>;

  /**
   * A list of all collections
   */
  @property()
  collections?: Collection[];

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    return this.object ? html`

    <nde-large-card .showImage="${false}">
      <div slot="title">${this.translator?.translate('nde.features.object.card.identification.title')}</div>
      <div slot="subtitle">${this.translator?.translate('nde.features.object.card.identification.subtitle')}</div>
      <div slot="icon">
        ${unsafeSVG(Identity)}
      </div>
      <div slot="content">
        <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="identifier">
          <label slot="label" for="identifier">${this.translator?.translate('nde.features.object.card.field.identifier')}</label>
          <input type="text" slot="input" name="identifier" id="identifier"/>
        </nde-form-element>
        <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="type">
          <label slot="label" for="type">${this.translator?.translate('nde.features.object.card.field.type')}</label>
          <input type="text" slot="input" name="type" id="type"/>
        </nde-form-element>
        <nde-form-element
          .actor="${this.formActor}"
          .translator="${this.translator}"
          field="additionalType"
        >
          <label slot="label" for="additionalType">${this.translator?.translate('nde.features.object.card.field.additionalType')}</label>
          <ul slot="input" name="additionalType" id="additionalType" type="dismiss" class="dismiss">
            ${this.object.additionalType?.map((value: Term) => html`<li id="${value.uri}">${value.name}</li>`)}
          </ul>
          <button @click="${() => this.dispatchEvent(new CustomEvent<{ field: string; terms: Term[] }>('CLICKED_TERM_FIELD', { bubbles: true, composed: true, detail: { field: 'additionalType', terms: this.object.additionalType } }))}" type="button" slot="action">
            ${ unsafeSVG(Connect) }
          </button>
        </nde-form-element>
        <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="name">
          <label slot="label" for="name">${this.translator?.translate('nde.features.object.card.field.name')}</label>
          <input type="text" slot="input" name="name" id="name"/>
        </nde-form-element>
        <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="description">
          <label slot="label" for="description">${this.translator?.translate('nde.features.object.card.field.description')}</label>
          <textarea type="text" slot="input" name="description" id="description"/></textarea>
        </nde-form-element>
        <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="collection">
          <label slot="label" for="collection">${this.translator?.translate('nde.features.object.card.field.collection')}</label>
          <select slot="input" name="collection" id="collection">
            ${this.collections.map((collection) => html`<option id="${collection.uri}" ?selected="${collection.uri === this.object.collection}">${collection.name}</option>`)}
          </select>
        </nde-form-element>
      </div>
    </nde-large-card>
  ` : html``;

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
      `,
    ];

  }

}

export default ObjectIdentificationComponent;
