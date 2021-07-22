import { ArgumentError } from '../errors/argument-error';
import { fulltextMatch } from './fulltext-match';

describe('fulltextMatch()', () => {

  it('should throw error when no term is given', () => {

    expect(() => fulltextMatch({ foo: 'bar' }, null)).toThrow(ArgumentError);

  });

  it.each([
    // should match
    [ { foo: 'foo' }, 'foo', true ],
    [ { foo: 'foo', bar: 'bar' }, 'foo', true ],
    [ { foo: 'foobar' }, 'foo', true ],
    [ { foo: 'barfoobar' }, 'foo', true ],
    [ { foo: [ { name: 'foobar' } ] }, 'foo', true ],
    [ { foo: [ { abcdef: 'foobar' } ] }, 'foo', true ],
    [ { foo: [ 'foobar' ] }, 'foo', true ],
    [ { foo: 321 }, '3', true ],
    // should not match
    [ { foo: 'bar' }, 'foo', false ],
    [ { foo: [ { attribute: 'foobar' } ] }, 'baz', false ],
    [ { foo: [ { property: undefined } ] }, 'baz', false ],
    [ { foo: [ { x: null } ] }, 'baz', false ],
    [ { foo: [ {} ] }, 'baz', false ],
    [ { foo: [ 'foobar' ] }, 'baz', false ],
    [ { foo: [ undefined ] }, 'baz', false ],
    [ { foo: [ null ] }, 'baz', false ],
    [ { foo: [ ] }, 'baz', false ],
    [ { foo: 321 }, '5', false ],
    [ { foo: '' }, 'foo', false ],
    [ { foo: null }, 'foo', false ],
    [ { foo: { foo: 'foo' } }, 'bar', false ],
    [ { }, 'foo', false ],
  ])(`object %s should match term "%s": %s`, (object, term, result) => {

    expect(fulltextMatch(object, term)).toBe(result);

  });

});
