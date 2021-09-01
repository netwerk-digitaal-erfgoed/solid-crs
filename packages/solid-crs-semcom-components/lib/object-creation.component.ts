import { html, property, unsafeCSS, css, TemplateResult, CSSResult } from 'lit-element';
import { CollectionObject, Logger, sort, Term, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { FormEvent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { SpawnedActorRef } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { Theme, Object as ObjectIcon, Connect } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';

/**
 * The root page of the object feature.
 */
export class ObjectCreationComponent extends RxLitElement {

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
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    return this.object ? html`

    <nde-large-card .showImage="${false}">
      <div slot="title">${this.translator?.translate('object.card.creation.title')}</div>
      <div slot="subtitle">${this.translator?.translate('object.card.creation.subtitle')}</div>
      <div slot="icon">
        ${unsafeSVG(ObjectIcon)}
      </div>
      <div slot="content">
        <nde-form-element
          .actor="${this.formActor}"
          .translator="${this.translator}"
          field="creator"
          >
          <label slot="label" for="creator">${this.translator?.translate('object.card.creation.field.creator.title')}</label>
          <ul slot="input" name="creator" id="creator" type="dismiss" class="dismiss">
            ${sort(this.object.creator ?? []).map((value: Term) => html`<li id="${value.uri}">${value.name}</li>`)}
          </ul>
          <button
            @click="${() => this.dispatchEvent(new CustomEvent<{ field: string; terms: Term[] }>('CLICKED_TERM_FIELD', { bubbles: true, composed: true, detail: { field: 'creator', terms: this.object.creator } }))}"
            type="button" slot="action">
            ${ unsafeSVG(Connect) }
          </button>
          <label slot="help" for="event">${this.translator?.translate('object.card.creation.field.creator.description')}</label>
        </nde-form-element>
        <nde-form-element
          .actor="${this.formActor}"
          .translator="${this.translator}"
          field="locationCreated"
          >
          <label slot="label" for="locationCreated">${this.translator?.translate('object.card.creation.field.locationCreated.title')}</label>
          <ul slot="input" name="locationCreated" id="locationCreated" type="dismiss" class="dismiss">
            ${sort(this.object.locationCreated ?? []).map((value: Term) => html`<li id="${value.uri}">${value.name}</li>`)}
          </ul>
          <button
            @click="${() => this.dispatchEvent(new CustomEvent<{ field: string; terms: Term[] }>('CLICKED_TERM_FIELD', { bubbles: true, composed: true, detail: { field: 'locationCreated', terms: this.object.locationCreated } }))}"
            type="button" slot="action">
            ${ unsafeSVG(Connect) }
          </button>
          <label slot="help" for="event">${this.translator?.translate('object.card.creation.field.locationCreated.description')}</label>
        </nde-form-element>
        <nde-form-element
          .actor="${this.formActor}"
          .translator="${this.translator}"
          field="material"
          >
          <label slot="label" for="material">${this.translator?.translate('object.card.creation.field.material.title')}</label>
          <ul slot="input" name="material" id="material" type="dismiss" class="dismiss">
            ${sort(this.object.material ?? []).map((value: Term) => html`<li id="${value.uri}">${value.name}</li>`)}
          </ul>
          <button
            @click="${() => this.dispatchEvent(new CustomEvent<{ field: string; terms: Term[] }>('CLICKED_TERM_FIELD', { bubbles: true, composed: true, detail: { field: 'material', terms: this.object.material } }))}"
            type="button" slot="action">
            ${ unsafeSVG(Connect) }
          </button>
          <label slot="help" for="event">${this.translator?.translate('object.card.creation.field.material.description')}</label>
        </nde-form-element>
        <nde-form-element
          .actor="${this.formActor}"
          .translator="${this.translator}"
          field="dateCreated"
        >
          <label slot="label" for="dateCreated">${this.translator?.translate('object.card.creation.field.date.title')}</label>
          <input type="text" slot="input" name="dateCreated" id="dateCreated" placeholder="YYYY-MM-DD"/>
          <label slot="help" for="event">${this.translator?.translate('object.card.creation.field.date.description')}</label>
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

export default ObjectCreationComponent;
