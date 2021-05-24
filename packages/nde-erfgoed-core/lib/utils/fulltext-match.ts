import { ArgumentError } from '../errors/argument-error';

/**
 * Case-insensitive fulltext matching.
 *
 * @param obj Object to match.
 * @param term The term to match.
 * @returns If a property matches the term.
 */
export const fulltextMatch = (obj: unknown, term: string): boolean => {

  if (!obj) {

    throw new ArgumentError('Argument obj should be set.', obj);

  }

  if (!term) {

    throw new ArgumentError('Argument term should be set.', term);

  }

  const lowercaseTerm: string = term.toLowerCase();

  const numberOfMatches = Object.values(obj)
    .map((value) => typeof value === 'string' || value instanceof String ? value.toLowerCase().includes(lowercaseTerm) : false)
    .filter((value) => value === true)
    .length;

  return numberOfMatches > 0;

};
