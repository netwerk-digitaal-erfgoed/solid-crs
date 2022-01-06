import { InteractionHandler, getLoggerFor, InteractionHandlerInput, InteractionResponseResult, readJsonStream } from '@solid/community-server';
import { NoCredentialRegistrationManager, RegistrationResponse } from './NoCredentialRegistrationManager';

/**
 * Supports registration based on the `NoCredentialRegistrationManager` behaviour.
 */
export class NoCredentialRegistrationHandler extends InteractionHandler {

  protected readonly logger = getLoggerFor(this);

  private readonly registrationManager: NoCredentialRegistrationManager;

  constructor(registrationManager: NoCredentialRegistrationManager) {

    super();
    this.registrationManager = registrationManager;

  }

  async handle({ operation }: InteractionHandlerInput):
  Promise<InteractionResponseResult<RegistrationResponse>> {

    const data = await readJsonStream(operation.body.data);
    const validated = this.registrationManager.validateInput(data, false);
    const details = await this.registrationManager.register(validated, false);

    return { type: 'response', details };

  }

}
