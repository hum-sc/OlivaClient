import { createSlice } from '@reduxjs/toolkit';

export interface FileViewerState {
  isOpen: boolean;
}

const initialState: FileViewerState = {
  isOpen: false,
};

const fileViewerReducer = createSlice({
  name: 'fileViewer',
  initialState,
  reducers: {
    openFileViewer: (state) => {
      state.isOpen = true;
    },
    closeFileViewer: (state) => {
      state.isOpen = false;
    },
    toggleFileViewer: (state) => {
      state.isOpen = !state.isOpen;
    }
  },
});

export const { openFileViewer, closeFileViewer, toggleFileViewer } = fileViewerReducer.actions;
export default fileViewerReducer.reducer;
