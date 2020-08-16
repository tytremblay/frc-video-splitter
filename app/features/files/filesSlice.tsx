import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { AppThunk, RootState } from '../../store';

export type FilesState = {
  files: string[];
};

const initialState: FilesState = {
  files: [],
};

const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    addFiles: (state, action: PayloadAction<string[]>): void => {
      state.files = state.files.concat(action.payload);
    },
    removeFiles: (state, action: PayloadAction<string[]>): void => {
      state.files = state.files.filter(function (el) {
        return action.payload.indexOf(el) < 0;
      });
    },
  },
});

export const selectFiles = (state: RootState) => {
  return state.files;
};

export const { addFiles, removeFiles } = filesSlice.actions;

export default filesSlice.reducer;
