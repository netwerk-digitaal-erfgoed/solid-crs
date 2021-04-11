import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Collection, Store, MemoryStore } from '@digita-ai/nde-erfgoed-core';
import { CollectionsState } from './collections.state';

const collections: Store<Collection> = new MemoryStore<Collection>([
  {
    uri: 'test',
    name: 'Foo',
  },
  {
    uri: 'test',
    name: 'Bar',
  },
]);

/**
 * An action to get all collections.
 */
export const getAllCollections = createAsyncThunk('collections/getAll', async () => await collections.all().toPromise());

/**
 * The initial state of the collections feature.
 */
const initialState: CollectionsState = {
  collections: [],
  loading: false,
};

/**
 * The slice of the collections feature.
 */
const collectionsSlice = createSlice({
  name: 'collections',
  initialState,
  reducers: {
  },
  extraReducers: (builder) => builder
    .addCase(getAllCollections.pending, (state, action) => ({
      ...state,
      loading: true,
    }))
    .addCase(getAllCollections.fulfilled, (state, action) => ({
      ...state,
      collections: action.payload,
      loading: false,
    })),
});

/**
 * The reducer of the collection feature.
 */
export default collectionsSlice.reducer;
