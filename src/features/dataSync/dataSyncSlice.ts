import { createSlice } from "@reduxjs/toolkit";
import { type Metadata } from "../../OlivaFormat/src/Oliva";

// Helper function to find notebook index by ID
const findNotebookIndexById = (
    notebooks: (Metadata | NotebookModification)[], 
    notebookId: string | undefined
): number => {
    if (!notebookId) return -1;
    return notebooks.findIndex(n => n.id === notebookId);
};

// extend NotebookMetadata to include typee of modifications
export type NotebookModification =  Metadata & {
    typeOfModification: 'added' | 'updated' | 'deleted';
}

type Modification = {
    id: string;
    notebookId: string;
    type: 'added' | 'updated' | 'deleted';
}

export type DataSyncState = {
    isSyncing: boolean;
    lastMetadataSync: string | null;
    lastOnlineMetadataSync?: string | null;
    offlineNotbooksModification: NotebookModification[];
    localNotebooksMetadata: Metadata[];
    downloadedNotebooks: string[];
};

const dataSyncSlice = createSlice({
    name: "dataSync",
    initialState: {
        isSyncing: false,
        lastMetadataSync: null,
        lastOnlineMetadataSync: null,
        offlineNotbooksModification: [],
        localNotebooksMetadata: [],
        downloadedNotebooks: []
    } as DataSyncState,
    reducers: {
        setSyncing(state) {
            state.isSyncing = true;
        },
        addOfflineNotebookMetadata(state, action) {
            const payload: NotebookModification = action.payload;
            const existingIndex = findNotebookIndexById(state.offlineNotbooksModification, action.payload.id);
            const existingLocalIndex = findNotebookIndexById(state.localNotebooksMetadata, action.payload.id);
            if (existingLocalIndex >= 0) {
                console.log("Updating local notebook metadata for notebook_id:", action.payload.id);
                // Add only the notebook metadata without modification type
                state.localNotebooksMetadata[existingLocalIndex] = payload;
            } else {
                console.log("Adding new local notebook metadata for notebook_id:", action.payload.id);
                state.localNotebooksMetadata.push(action.payload);
            }

            if (existingIndex >= 0) {
                state.offlineNotbooksModification[existingIndex] = action.payload;
            } else {
                state.offlineNotbooksModification.push(action.payload);
            }
        },
        addOnlineNotebookMetadata(state, action ) {
            const payload: Metadata[] = action.payload;

            for(const metadata of payload){
                const existingIndex = findNotebookIndexById(state.localNotebooksMetadata, metadata.id);
                if (existingIndex >= 0) {
                    if(state.localNotebooksMetadata[existingIndex].updated_at! < metadata.updated_at!){
                        console.log("Updating local notebook metadata for notebook_id:", metadata.id);
                        state.localNotebooksMetadata[existingIndex] = metadata;
                    }
                } else {
                    console.log("Adding new local notebook metadata for notebook_id:", metadata.id);
                    const wasOfflineDeleted = state.offlineNotbooksModification.findIndex(n => n.id === metadata.id && n.typeOfModification === 'deleted');
                    if(wasOfflineDeleted < 0) state.localNotebooksMetadata.push(metadata);
                }
            }

            for( const metadata of state.localNotebooksMetadata){
                if(!payload.find(n => n.id === metadata.id)){
                    const existOfflineIndex = findNotebookIndexById(state.offlineNotbooksModification, metadata.id);
                    if(existOfflineIndex < 0){
                        state.localNotebooksMetadata = state.localNotebooksMetadata.filter(n => n.id !== metadata.id);
                    }
                }
            }
            state.lastOnlineMetadataSync = new Date().toISOString();
        },
        deleteOnlineNotebookMetadata(state, action) {
            const notebookId: string = action.payload;
            state.localNotebooksMetadata = state.localNotebooksMetadata.filter(n => n.id !== notebookId);
        },
        deleteOfflineNotebookMetadata(state, action) {
            const notebookId: string = action.payload;
            const metadata = state.localNotebooksMetadata.find(n => n.id === notebookId);
            if(metadata){
                state.offlineNotbooksModification.push({
                    ...metadata,
                    typeOfModification: 'deleted'
                });
            }
            state.localNotebooksMetadata = state.localNotebooksMetadata.filter(n => n.id !== notebookId);
        },
        addDownloadedNotebook(state, action) {
            if(!state.downloadedNotebooks.includes(action.payload)) state.downloadedNotebooks.push(action.payload);
        },
        removeDownloadedNotebook(state, action) {
            state.downloadedNotebooks = state.downloadedNotebooks.filter(id => id !== action.payload);
        },
        syncedNotebookModification(state, action) {
            const existingIndex = findNotebookIndexById(state.offlineNotbooksModification, action.payload.id);
            if (existingIndex >= 0) {
                // Remove from offline modifications
                state.offlineNotbooksModification.splice(existingIndex, 1);
            }
        },
        userLoggedOut(state) {
            state.isSyncing = false;
            state.lastMetadataSync = null;
            state.lastOnlineMetadataSync = null;
            state.offlineNotbooksModification = [];
            state.localNotebooksMetadata = [];
            state.downloadedNotebooks = [];
        }
    },
});

export const { setSyncing, addOfflineNotebookMetadata, addOnlineNotebookMetadata, addDownloadedNotebook, removeDownloadedNotebook, userLoggedOut , deleteOnlineNotebookMetadata, deleteOfflineNotebookMetadata, syncedNotebookModification} = dataSyncSlice.actions;
export default dataSyncSlice.reducer;