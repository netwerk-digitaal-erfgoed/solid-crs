import { Term } from '../terms/term';

/**
 * Sorts list alphabetically.
 *
 * @param list The list to sort.
 * @returns A sorted list.
 */
export const sort = (list: Term[]): Term[] => list.sort((a, b) =>{

  if (a.name.toLowerCase() === b.name.toLowerCase()) {

    return 0;

  }

  return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;

});
