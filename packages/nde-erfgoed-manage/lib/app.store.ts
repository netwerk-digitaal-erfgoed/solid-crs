import { configureStore } from '@reduxjs/toolkit';
import { Observable } from 'rxjs';
import collectionsReducer from './features/collections/collections.slice';

/**
 * The state store used throughout the applcation.
 */
export const appStore = configureStore({
  reducer: {
    collections: collectionsReducer,
  },
});

/**
 * Selects a part of the state and returns an observable.
 *
 * @param selector A function which returns a slice of the state.
 * @returns The requested slice.
 */
export const select = <T>(selector: (state: AppState) => T): Observable<T> => new Observable((subscriber) => {
  appStore.subscribe(() => {
    const slice = selector(appStore.getState());

    subscriber.next(slice);
  });

  const initialSlice = selector(appStore.getState());

  subscriber.next(initialSlice);
});

export const dispatch = appStore.dispatch;

/**
 * A type which represents the app-wide state.
 */
export type AppState = ReturnType<typeof appStore.getState>;

export default appStore;
