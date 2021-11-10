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

  const lowercaseTerm: string = term.toLowerCase().trim();
  const splitTerm: string[] = lowercaseTerm.split(' ');

  return splitTerm.every((termPart: string) => Object.values(object).some((value: any) => {

    if (typeof value === 'string' || value instanceof String) {

      return value.toLowerCase().includes(termPart);

    } else if (typeof value === 'number' || value instanceof Number) {

      return value.toString().toLowerCase().includes(termPart);

    } else if (value instanceof Array && value.length > 0) {

      return value.some((element) => fulltextMatch({ key: element }, termPart));

    } else if (typeof value === 'object' || value instanceof Object) {

      return fulltextMatch(value, termPart);

    } else {

      return false;

    }

  }));

};
