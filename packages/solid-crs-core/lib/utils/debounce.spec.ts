import { debounce } from './debounce';

describe('debounce()', () => {

  const func = jest.fn(() => expect(true).toBeTruthy());

  it('should call passed function', async () => {

    debounce(func, 250)();

  });

});
