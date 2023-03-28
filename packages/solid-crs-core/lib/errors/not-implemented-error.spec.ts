import { NotImplementedError } from './not-implemented-error';

describe('NotImplementedError', () => {

  it('should create', async () => {

    const err = new NotImplementedError();

    expect(err).toBeDefined();

  });

});
