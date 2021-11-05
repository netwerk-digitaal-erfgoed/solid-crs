import { ArgumentError } from '../errors/argument-error';

/**
 * Case-insensitive fulltext matching.
 *
 * @param object Object to match.
 * @param term The term to match.
 * @returns If a property matches the term.
 */
export const fulltextMatch = (object: unknown, term: string): boolean => {

  if (object === null || object === undefined) {

    return false;

  }

  if (!term && term !== '') {

    throw new ArgumentError('Argument term should be set.', term);

  }

  const lowercaseTerm: string = term.toLowerCase();
  const splitTerm: string[] = lowercaseTerm.split(' ');

  return !!Object.values(object)
    .map((value) => {

      if (typeof value === 'string' || value instanceof String) {

        return splitTerm.every((t: string) => value.toLowerCase().includes(t));

      } else if (typeof value === 'number' || value instanceof Number) {

        return splitTerm.every((t: string) => value.toString().toLowerCase().includes(t));

      } else if (value instanceof Array && value.length > 0) {

        return !!value.find((element) => fulltextMatch({ key: element }, lowercaseTerm));

      } else if (typeof value === 'object' || value instanceof Object) {

        return fulltextMatch(value, lowercaseTerm);

      } else {

        return false;

      }

    }).find((value) => value === true);

};
