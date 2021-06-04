import { html, property, PropertyValues, internalProperty, unsafeCSS, css, TemplateResult, CSSResult } from 'lit-element';
import { Collection, CollectionObject, Logger, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { FormEvent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { Interpreter, SpawnedActorRef, State } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { Theme, Identity } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { from } from 'rxjs';
import { ObjectContext } from '../object.machine';

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
  @internalProperty()
  object?: CollectionObject;

  /**
   * The actor responsible for form validation in this component.
   */
  @property()
  formActor: SpawnedActorRef<FormEvent>;

  /**
   * The actor controlling this component.
   */
  @property({ type: Object })
  public actor: Interpreter<ObjectContext>;

  /**
   * The state of the actor.
   */
  @internalProperty()
  state?: State<ObjectContext>;

  /**
   * A list of all collections
   */
  @internalProperty()
  collections?: Collection[];

  /**
   * Hook called on at every update after connection to the DOM.
   */
  firstUpdated(changed: PropertyValues): void {

    super.firstUpdated(changed);

    this.subscribe('state', from(this.actor));

  }

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
          <label slot="label" for="identifier">${this.translator?.translate('nde.features.object.card.identification.field.object-number')}</label>
          <input type="text" slot="input" name="identifier"/>
        </nde-form-element>
        <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="type">
          <label slot="label" for="type">${this.translator?.translate('nde.features.object.card.identification.field.type')}</label>
          <input type="text" slot="input" name="type"/>
        </nde-form-element>
        <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="additionalType">
          <label slot="label" for="additionalType">${this.translator?.translate('nde.features.object.card.identification.field.object-name')}</label>
          <input type="text" slot="input" name="additionalType"/>
        </nde-form-element>
        <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="name">
          <label slot="label" for="name">${this.translator?.translate('nde.features.object.card.identification.field.title')}</label>
          <input type="text" slot="input" name="name"/>
        </nde-form-element>
        <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="description">
          <label slot="label" for="description">${this.translator?.translate('nde.features.object.card.identification.field.description')}</label>
          <textarea type="text" slot="input" name="description"/></textarea>
        </nde-form-element>
        <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="collection">
          <label slot="label" for="collection">${this.translator?.translate('nde.features.object.card.identification.field.collection')}</label>
          <select slot="input" name="collection">
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
