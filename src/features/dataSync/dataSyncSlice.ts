import { createSlice } from "@reduxjs/toolkit";
import type { AutomergeUrl, DocHandle, Repo } from "@automerge/react";
import type { MetadataList } from "./MetadataStore";


export type DataSyncState = {
    docUrl: AutomergeUrl;
    repo: Repo;
    handle: DocHandle<MetadataList>;
};

const dataSyncSlice = createSlice({
    name: "dataSync",
    initialState: {
        docUrl: "" as AutomergeUrl,
    } as DataSyncState,
    reducers: {
        setDocUrl(state, action) {
            state.docUrl = action.payload;
        },
        userLoggedOut(state) {
            state.docUrl = undefined as unknown as AutomergeUrl;
            state.handle = undefined as unknown as DocHandle<MetadataList>;
            state.repo = undefined as unknown as Repo;
        },
        initAutomerge(state, action) {
            state.repo = action.payload.repo;
            state.handle = action.payload.handle;
            state.docUrl = action.payload.handle.url;
        }
    },
});

export const { setDocUrl, userLoggedOut, initAutomerge } = dataSyncSlice.actions;
export default dataSyncSlice.reducer;