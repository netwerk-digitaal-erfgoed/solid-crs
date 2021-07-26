import { AbstractRegisterComponentService, ComponentMetadata, QueryComponentService } from '@digita-ai/semcom-core';
import { QueryComponentRemoteService, RegisterComponentService } from '@digita-ai/semcom-sdk';

export class SemComService {

  private registry: AbstractRegisterComponentService;

  private repo: QueryComponentService;

  constructor() {

    this.registry =  new RegisterComponentService();
    this.repo = new QueryComponentRemoteService(process.env.VITE_SEMCOM_NODE_URI);

  }

  queryComponents(filter: Partial<ComponentMetadata>): Promise<ComponentMetadata[]> {

    return this.repo.query(filter);

  }

  registerComponent(metadata: ComponentMetadata): Promise<string> {

    return this.registry.register(metadata);

  }

}
