import { html, property, PropertyValues, internalProperty, unsafeCSS, css, TemplateResult, CSSResult } from 'lit-element';
import { CollectionObject, Logger, Translator } from '@netwerk-digitaal-erfgoed/solid-crs-core';
import { FormEvent } from '@netwerk-digitaal-erfgoed/solid-crs-components';
import { Interpreter, SpawnedActorRef, State } from 'xstate';
import { RxLitElement } from 'rx-lit';
import { Theme, Identity } from '@netwerk-digitaal-erfgoed/solid-crs-theme';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { from } from 'rxjs';
import { ObjectContext, ObjectStates } from '../object.machine';
import { ObjectEvents } from '../object.events';

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

    const editing = this.state?.matches(ObjectStates.EDITING);

    const initializeFormMachine = () => { if (!editing) { this.actor.send(ObjectEvents.CLICKED_EDIT); } };

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
          <input type="text" slot="input" name="identifier" value="${this.object.identifier}" @click="${initializeFormMachine}"/>
        </nde-form-element>
        <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="type">
          <label slot="label" for="type">${this.translator?.translate('nde.features.object.card.identification.field.type')}</label>
          <input type="text" slot="input" name="type" value="${this.object.type}" @click="${initializeFormMachine}"/>
        </nde-form-element>
        <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="additionalType">
          <label slot="label" for="additionalType">${this.translator?.translate('nde.features.object.card.identification.field.object-name')}</label>
          <input type="text" slot="input" name="additionalType" value="${this.object.additionalType}" @click="${initializeFormMachine}"/>
        </nde-form-element>
        <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="name">
          <label slot="label" for="name">${this.translator?.translate('nde.features.object.card.identification.field.title')}</label>
          <input type="text" slot="input" name="name" value="${this.object.name}" @click="${initializeFormMachine}"/>
        </nde-form-element>
        <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="description">
          <label slot="label" for="description">${this.translator?.translate('nde.features.object.card.identification.field.description')}</label>
          <input type="text" slot="input" name="description" value="${this.object.description}" @click="${initializeFormMachine}"/>
        </nde-form-element>
        <nde-form-element .actor="${this.formActor}" .translator="${this.translator}" field="collection">
          <label slot="label" for="collection">${this.translator?.translate('nde.features.object.card.identification.field.collection')}</label>
          <input type="text" slot="input" name="collection" value="${this.object.collection}" @click="${initializeFormMachine}"/>
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