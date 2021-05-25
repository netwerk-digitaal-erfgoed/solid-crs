import { ArgumentError } from '../errors/argument-error';
import { fulltextMatch } from './fulltext-match';

describe('fulltextMatch()', () => {

  it('should throw error when no object or term is given', () => {

    expect(() => fulltextMatch(null, 'foo')).toThrow(ArgumentError);
    expect(() => fulltextMatch({ foo: 'bar' }, null)).toThrow(ArgumentError);

  });

  it.each([
    [ { foo: 'bar' }, 'foo', false ],
    [ { foo: 'foo' }, 'foo', true ],
    [ { foo: 'foo', bar: 'bar' }, 'foo', true ],
    [ { foo: 'foobar' }, 'foo', true ],
    [ { foo: 'barfoobar' }, 'foo', true ],
    [ { foo: '' }, 'foo', false ],
    [ { foo: null }, 'foo', false ],
    [ { foo: { foo: 'foo' } }, 'foo', false ],
    [ { }, 'foo', false ],
  ])('should match object', (object, term, result) => {

    expect(fulltextMatch(object, term)).toBe(result);

  });

});
