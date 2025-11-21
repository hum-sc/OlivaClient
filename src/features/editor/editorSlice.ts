import {createSlice} from '@reduxjs/toolkit';
import type { Oli } from '../../OlivaFormat/oli';
type EditorState = {
    metadata?: Oli['metadata'];
    notebookPixelsWidth?: number;
    notebookPixelsHeight?: number;
};

const editorSlice = createSlice({
    name: 'editor',
    initialState: {
        metadata: undefined,
        notebookPixelsWidth: undefined,
        notebookPixelsHeight: undefined,
    } as EditorState,
    reducers: {
        setMetadata(state, action) {
            console.log(action.payload)
            state.metadata = action.payload;
        },
        setNotebookPixelsWidth(state, action) {
            state.notebookPixelsWidth = action.payload;
            state.notebookPixelsHeight = action.payload * (state.metadata!.paper.dimensions.height / state.metadata!.paper.dimensions.width);
        }
    },
});

export const { setMetadata, setNotebookPixelsWidth } = editorSlice.actions;

export default editorSlice.reducer;