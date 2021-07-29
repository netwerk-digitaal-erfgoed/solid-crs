import { ComponentMetadata } from '@digita-ai/semcom-core';
import { SemComService } from './semcom.service';

describe('SemComService', () => {

  let service: SemComService;
  let metadata: ComponentMetadata;

  beforeEach(() => {

    process.env.VITE_SEMCOM_NODE_URI = 'http://localhost/';
    service = new SemComService();

    metadata = {
      uri: '',
      tag: '',
      label: '',
      description: '',
      author: '',
      version: '',
      latest: true,
      shapes: [],
    };

  });

  describe('queryComponents', () => {

    it('should call repo.query', async () => {

      service.repo.query = jest.fn(() => null);

      await service.queryComponents({ uri: '' });

      expect(service.repo.query).toHaveBeenCalled();

    });

  });

  describe('registerComponent', () => {

    it('should call registry.register', async () => {

      service.registry.register = jest.fn(() => null);

      await service.registerComponent(metadata);

      expect(service.registry.register).toHaveBeenCalled();

    });

  });

});
