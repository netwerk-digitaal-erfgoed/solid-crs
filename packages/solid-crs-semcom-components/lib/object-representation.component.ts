import { html, property, unsafeCSS, css, TemplateResult, CSSResult } from 'lit-element';
import { CollectionObject, Logger, sort, Term, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { FormEvent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { ActorRef } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { Theme, Object as ObjectIcon, Connect } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';

/**
 * The root page of the object feature.
 */
export class ObjectRepresentationComponent extends RxLitElement {

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
  formActor?: ActorRef<FormEvent>;

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render(): TemplateResult {

    return this.object ? html`

    <nde-large-card .showImage="${false}">
      <div slot="title">${this.translator?.translate('object.card.representation.title')}</div>
      <div slot="subtitle">${this.translator?.translate('object.card.representation.subtitle')}</div>
      <div slot="icon">
        ${unsafeSVG(ObjectIcon)}
      </div>
      <div slot="content">
        <nde-form-element
          .actor="${this.formActor}"
          .translator="${this.translator}"
          field="subject"
          >
          <label slot="label" for="subject">${this.translator?.translate('object.card.representation.field.subject.title')}</label>
          <ul slot="input" name="subject" id="subject" type="dismiss" class="dismiss">
            ${sort(this.object.subject ?? []).map((value: Term) => html`<li id="${value.uri}">${value.name}</li>`)}
          </ul>
          <button
            @click="${() => this.dispatchEvent(new CustomEvent<{ field: string; terms: Term[] }>('CLICKED_TERM_FIELD', { bubbles: true, composed: true, detail: { field: 'subject', terms: this.object?.subject ?? [] } }))}"
            type="button" slot="action">
            ${ unsafeSVG(Connect) }
          </button>
          <div slot="help" for="event">${this.translator?.translate('object.card.representation.field.subject.description')}</div>
        </nde-form-element>
        <nde-form-element
          .actor="${this.formActor}"
          .translator="${this.translator}"
          field="location"
          >
          <label slot="label" for="location">${this.translator?.translate('object.card.representation.field.location.title')}</label>
          <ul slot="input" name="location" id="location" type="dismiss" class="dismiss">
            ${this.object.location?.map((value: Term) => html`<li id="${value.uri}">${value.name}</li>`)}
          </ul>
          <button
            @click="${() => this.dispatchEvent(new CustomEvent<{ field: string; terms: Term[] }>('CLICKED_TERM_FIELD', { bubbles: true, composed: true, detail: { field: 'location', terms: this.object?.location ?? [] } }))}"
            type="button" slot="action">
            ${ unsafeSVG(Connect) }
          </button>
          <div slot="help" for="event">${this.translator?.translate('object.card.representation.field.location.description')}</div>
        </nde-form-element>
        <nde-form-element
          .actor="${this.formActor}"
          .translator="${this.translator}"
          field="person"
          >
          <label slot="label" for="person">${this.translator?.translate('object.card.representation.field.person.title')}</label>
          <ul slot="input" name="person" id="person" type="dismiss" class="dismiss">
            ${this.object.person?.map((value: Term) => html`<li id="${value.uri}">${value.name}</li>`)}
          </ul>
          <button
            @click="${() => this.dispatchEvent(new CustomEvent<{ field: string; terms: Term[] }>('CLICKED_TERM_FIELD', { bubbles: true, composed: true, detail: { field: 'person', terms: this.object?.person ?? [] } }))}"
            type="button" slot="action">
            ${ unsafeSVG(Connect) }
          </button>
          <div slot="help" for="event">${this.translator?.translate('object.card.representation.field.person.description')}</div>
        </nde-form-element>
        <nde-form-element
          .actor="${this.formActor}"
          .translator="${this.translator}"
          field="organization"
          >
          <label slot="label" for="organization">${this.translator?.translate('object.card.representation.field.organization.title')}</label>
          <ul slot="input" name="organization" id="organization" type="dismiss" class="dismiss">
            ${this.object.organization?.map((value: Term) => html`<li id="${value.uri}">${value.name}</li>`)}
          </ul>
          <button
            @click="${() => this.dispatchEvent(new CustomEvent<{ field: string; terms: Term[] }>('CLICKED_TERM_FIELD', { bubbles: true, composed: true, detail: { field: 'organization', terms: this.object?.organization ?? [] } }))}"
            type="button" slot="action">
            ${ unsafeSVG(Connect) }
          </button>
          <div slot="help" for="event">${this.translator?.translate('object.card.representation.field.organization.description')}</div>
        </nde-form-element>
        <nde-form-element
          .actor="${this.formActor}"
          .translator="${this.translator}"
          field="event"
          >
          <label slot="label" for="event">${this.translator?.translate('object.card.representation.field.event.title')}</label>
          <ul slot="input" name="event" id="event" type="dismiss" class="dismiss">
            ${this.object.event?.map((value: Term) => html`<li id="${value.uri}">${value.name}</li>`)}
          </ul>
          <button
            @click="${() => this.dispatchEvent(new CustomEvent<{ field: string; terms: Term[] }>('CLICKED_TERM_FIELD', { bubbles: true, composed: true, detail: { field: 'event', terms: this.object?.event ?? [] } }))}"
            type="button" slot="action">
            ${ unsafeSVG(Connect) }
          </button>
          <div slot="help" for="event">${this.translator?.translate('object.card.representation.field.event.description')}</div>
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
          gap: var(--gap-large);
        }
      `,
    ];

  }

}

export default ObjectRepresentationComponent;
