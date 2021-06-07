import { AbstractRegisterComponentService, ComponentMetadata, QueryComponentService } from '@digita-ai/semcom-core';
import { QueryComponentRemoteService, RegisterComponentService } from '@digita-ai/semcom-sdk';

export class SemComService {

  private registry: AbstractRegisterComponentService = new RegisterComponentService();

  private repo: QueryComponentService = new QueryComponentRemoteService('http://localhost:3003');

  queryComponents(filter: Partial<ComponentMetadata>): Promise<ComponentMetadata[]> {

    return this.repo.query(filter);

  }

  registerComponent(metadata: ComponentMetadata): Promise<string> {

    return this.registry.register(metadata);

  }

}
