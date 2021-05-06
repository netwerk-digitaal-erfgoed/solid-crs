import { of } from 'rxjs';

/**
 * Services for the collections component.
 */
const storedCollections = [
  {
    uri: 'test',
    name: 'Foo',
  },
  {
    uri: 'test',
    name: 'Bar',
  },
];

export const loadCollectionsService = of(storedCollections);
