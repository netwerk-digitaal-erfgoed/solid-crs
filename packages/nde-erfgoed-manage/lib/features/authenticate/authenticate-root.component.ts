import { css, html, property, PropertyValues, internalProperty } from 'lit-element';
import { Logger, Translator } from '@digita-ai/nde-erfgoed-core';
import { Event, Schema, FormActors, FormContext, FormRootStates, FormSubmissionStates, FormCleanlinessStates, FormValidationStates } from '@digita-ai/nde-erfgoed-components';
import { Interpreter, SpawnedActorRef, State, StateValueMap} from 'xstate';
import { RxLitElement } from 'rx-lit';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { Login, NdeLogoInverse } from '@digita-ai/nde-erfgoed-theme';
import { FormEvents } from '@digita-ai/nde-erfgoed-components/dist/forms/form.events';
import { map } from 'rxjs/operators';
import { from } from 'rxjs';
import { AuthenticateEvents } from './authenticate.events';
import { AuthenticateContext } from './authenticate.machine';

/**
 * The root page of the authenticate feature.
 */
export class AuthenticateRootComponent extends RxLitElement {

  /**
   * The component's logger.
   */
  @property({type: Logger})
  public logger: Logger;

  /**
   * The component's translator.
   */
  @property({type: Translator})
  public translator: Translator;

  /**
   * The actor controlling this component.
   */
  @property({type: Object})
  public actor: Interpreter<AuthenticateContext, Schema<AuthenticateContext, AuthenticateEvents>, Event<AuthenticateEvents>>;

  /**
   * The actor responsible for form validation in this component.
   */
  @internalProperty()
  formActor: SpawnedActorRef<Event<FormEvents>, State<FormContext<{webId: string}>>>;

  /**
   * The state of this component.
   */
  @internalProperty()
  state?: State<AuthenticateContext>;

  /**
   * The state of this component.
   */
  @internalProperty()
  enableSubmit?: boolean;

  /**
   * Hook called on first update after connection to the DOM.
   * It subscribes to the actor, logs state changes, and pipes state to the properties.
   */
  firstUpdated(changed: PropertyValues) {
    super.firstUpdated(changed);

    this.formActor = this.actor.children.get(FormActors.FORM_MACHINE);

    this.subscribe('enableSubmit', from(this.formActor).pipe(
      map((state) => state.value as StateValueMap),
      map((value) => value[FormRootStates.CLEANLINESS] === FormCleanlinessStates.DIRTY
      && value[FormRootStates.VALIDATION] === FormValidationStates.VALID
      && value[FormRootStates.SUBMISSION] === FormSubmissionStates.NOT_SUBMITTED),
    ));
  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {
    return this.formActor ? html`
      <link href="./dist/bundles/styles.css" rel="stylesheet">
      <div class="title-container">
        <svg> ${ unsafeSVG(NdeLogoInverse) } </svg>
        <h1>${this.translator.translate('nde.features.authenticate.pages.login.title')}</h1>
      </div>
      <div class="form-container">
        <form>
          <nde-form-element .border="${false}" .actor="${this.formActor}" .translator="${this.translator}" field="webId">
            <div slot="icon"></div>
            <input type="text" slot="input" placeholder="${this.translator.translate('nde.features.authenticate.pages.login.search-placeholder')}" />
            <button slot="action" ?disabled="${!this.enableSubmit}" @click="${() => this.formActor.send(FormEvents.FORM_SUBMITTED)}">${ unsafeSVG(Login) }</button>
          </nde-form-element>
        </form>
      </div>
      <div></div>
    ` : html``;
  }

  /**
   * The styles associated with the component.
   */
  static get styles() {
    return [
      css`
        :host {
          width: 400px;
          height: 100%;
          margin: auto;
          display: flex;
          flex-direction: column;
          gap: 80px;
        }

        .title-container {
          margin-top: 30vh; 
          max-height: 50px;
          height: 50px;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
        }

        .title-container svg {
          max-height: 50px;
          height: 50px;
          max-width: 50px;
          width: 50px;
        }

        .title-container h1 {
          color: white;
          font-size: var(--font-size-header-normal);
          font-weight: normal;
        }

        nde-form-element button {
          background-color: var(--colors-primary-light);
        }

        nde-form-element {
          border: none;
        }
      `,
    ];
  }

}
