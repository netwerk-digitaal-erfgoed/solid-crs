import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { CollectionsEvents } from './collections.events';

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

export const loadCollectionsService = () => of(storedCollections).pipe(
  map((cols) => ({
    type: CollectionsEvents.LOADED_COLLECTIONS,
    collections: cols,
  })),
);
