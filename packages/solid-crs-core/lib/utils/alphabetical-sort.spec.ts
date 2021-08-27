import { sort } from './alphabetical-sort';

const term1 = { uri:'a', name:'a' };
const term2 = { uri:'b', name:'b' };
const term3 = { uri:'c', name:'c' };

const sortedList = [ term1, term1, term2, term3 ];
const unsortedList = [ term2, term1, term3, term1 ];

describe('sort()', () => {

  it('should sort terms alphabetically', () => {

    const result = sort(unsortedList);
    expect(result).toEqual(sortedList);

  });

});
