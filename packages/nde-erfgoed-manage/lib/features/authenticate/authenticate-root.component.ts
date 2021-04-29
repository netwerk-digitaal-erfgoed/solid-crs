import { html, property, PropertyValues, internalProperty, unsafeCSS, css } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { ArgumentError, Logger, Translator } from '@digita-ai/nde-erfgoed-core';
import { Event, FormActors, FormContext, FormRootStates, FormSubmissionStates, FormCleanlinessStates, FormValidationStates, FormEvents } from '@digita-ai/nde-erfgoed-components';
import { Interpreter, SpawnedActorRef, State} from 'xstate';
import { RxLitElement } from 'rx-lit';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg';
import { Login, NdeLogoInverse, Theme } from '@digita-ai/nde-erfgoed-theme';
import { map } from 'rxjs/operators';
import { from } from 'rxjs';
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
  public actor: Interpreter<AuthenticateContext>;

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

    if (!this.formActor) {
      throw new ArgumentError('Argument this.formActor should be set.', this.formActor);
    }

    this.subscribe('enableSubmit', from(this.formActor).pipe(
      map((state) => state.matches({
        [FormRootStates.CLEANLINESS]: FormCleanlinessStates.DIRTY,
        [FormRootStates.VALIDATION]: FormValidationStates.VALID,
        [FormRootStates.SUBMISSION]: FormSubmissionStates.NOT_SUBMITTED,
      })),
    ));
  }

  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {
    return this.formActor ? html`
      <div class="title-container">
        ${ unsafeSVG(NdeLogoInverse) }
        <h1>${this.translator.translate('nde.features.authenticate.pages.login.title')}</h1>
      </div>
      <div class="form-container">
        <form>
          <nde-form-element .inverse="${true}" .actor="${this.formActor}" .translator="${this.translator}" field="webId">
            <div slot="icon"></div>
            <input type="text" slot="input" placeholder="${this.translator.translate('nde.features.authenticate.pages.login.search-placeholder')}" />
            <button slot="action" class="primary" ?disabled="${!this.enableSubmit}" @click="${() => this.formActor.send(FormEvents.FORM_SUBMITTED)}">${ unsafeSVG(Login) }</button>
          </nde-form-element>
        </form>
      </div>
      <div class="webid-container">
        <p> ${unsafeHTML(this.translator.translate('nde.features.authenticate.pages.login.create-webid'))}</p>
      </div>
    ` : html``;
  }

  /**
   * The styles associated with the component.
   */
  static get styles() {
    return [
      unsafeCSS(Theme),
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
          color: var(--colors-foreground-inverse);
        }
        
        .title-container svg {
          max-height: 50px;
          height: 50px;
          max-width: 50px;
          width: 50px;
          fill: var(--colors-foreground-inverse);
        }

        .title-container h1 {
          font-size: var(--font-size-header-normal);
          font-weight: normal;
        }
        
        .webid-container p {
          text-align: center;
          color: var(--colors-foreground-light);
          font-size: var(--font-size-small);
        }
      `,
    ];
  }

}
