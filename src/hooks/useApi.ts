import { login } from "../features/auth/authSlice";
import { addOfflineNotebookMetadata, addOnlineNotebookMetadata, deleteOfflineNotebookMetadata, deleteOnlineNotebookMetadata, syncedNotebookModification } from "../features/dataSync/dataSyncSlice";
import type { Oli } from "../OlivaFormat/oli";
import NotebookOliva, { type Metadata } from "../OlivaFormat/src/Oliva";
import { saveLocalNotebook, deleteLocalNotebook, readLocalNotebook } from "./indexdb";
import { appStore } from "./useStoredContext";
export const apiBaseUrl = 'http://localhost:8080';
export const loginUrl = `${apiBaseUrl}/auth/login`;

const totalNumberofColumns = 3;
const totalNumberofRows = 5;
const cueColumns = 1;
const summaryRows = 1;


const defaultPaper: Metadata["paper"] = {
    dimensions: {
        width: 210,
        height: 297,
        name: "A4"
    },
    orientation: "portrait"
};

const defaultLayout: Metadata["page_layout"] = {
    columns: totalNumberofColumns,
    rows: totalNumberofRows,
    cue_section: {
        columns: cueColumns,
        rows: totalNumberofRows - summaryRows
    },
    content_section: {
        columns: totalNumberofColumns - cueColumns,
        rows: totalNumberofRows - summaryRows
    },
    summary_section: {
        columns: totalNumberofColumns,
        rows: summaryRows
    }
}
const defaultFontSize = 12;
const defaultFontFamily: Metadata["body_font_family"] = {
    name: "Inter",
    generic_family: "sans-serif",
    url: "https://fonts.googleapis.com/css2?family=Inter&display=swap"
}
const defaultHeaderFontFamily: Metadata["header_font_family"] = {
    name: "Work Sans",
    generic_family: "sans-serif",
    url: "https://fonts.googleapis.com/css2?family=Work+Sans&display=swap"
}

export type User = {
    user_id: string;
    username: string;
    email: string;
    created_at: string;
    image_url?: string;
}
export type File = {
    file_uri: string;
    data: Blob;
    type: string;
}
export function getappStore(){
    return appStore;
}
export function getToken(): string {
    const token = appStore.getState().auth.token;
    if (!token) {
        throw new Error("No hay token disponible");
    }
    return token;
}
export async function getUserData(token: string): Promise<void> {
    // Get to user data endpoint with the sub in the body
    const user = await fetch(`${apiBaseUrl}/api/user`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }

    }).then(async response => {
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        const user: User = await response.json();
        return user;
    });
    appStore.dispatch(login({ user, token }));
}
export async function refreshToken(refreshToken: string) {
    return await fetch(`${apiBaseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh_token: refreshToken })
    }).then(response => {
        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }
        return response.json();
    });
}
export function logoutUser(refreshToken: string) {
    window.location.href = `${apiBaseUrl}/auth/logout?refresh_token=${refreshToken}`;
}
export async function getFile(fileId: string) {
    //TODO: Cache files locally using IndexedDB
    const token = getToken();
    if(!appStore.getState().onlineStatus.isOnline){
        throw new Error("Offline mode, cannot fetch file");
    }
    if(fileId.startsWith(apiBaseUrl))  return await fetch(`${fileId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }).then(async response => {
        if (!response.ok) {
            throw new Error('Failed to fetch file');
        }
        const fileData = await response.blob();
        // Save file locally
        return fileData;
    });

    else if (fileId.startsWith('http')) return await fetch(fileId).then(async response => {
        if (!response.ok) {
            throw new Error('Failed to fetch file');
        }
        const fileData = await response.blob();
        return fileData;
    })
    else return await fetch(`${apiBaseUrl}/files/${fileId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }).then(async response => {
        if (!response.ok) {
            throw new Error('Failed to fetch file');
        }
        const fileData = await response.blob();
        return fileData;
    });
}
export async function getNotebooksMetadata (){
    try{
        if(!appStore.getState().onlineStatus.isOnline) return;
        const token = getToken();
        const response = await fetch(`${apiBaseUrl}/notebooks/`,{
            method: 'GET',
            headers:{
                'Authorization':`Bearer ${token}`,
                'Content-Type':'application/json'
            }
        });
        
        const newOnlineNotebooks: Metadata[] = await response.json();
        console.log("Fetched online notebooks metadata:", newOnlineNotebooks.length);
        appStore.dispatch(addOnlineNotebookMetadata(newOnlineNotebooks));
    } catch (error){
        return;
    }
}
export async function newNotebook(){
    const user = appStore.getState().auth.user;
    try{
        const token = getToken();
        const isOnline = appStore.getState().onlineStatus.isOnline;
        let metadata: Metadata;
        try{
            if(!isOnline) throw new Error("Offline mode");
            const response = await fetch(`${apiBaseUrl}/notebooks/new`,{
                method: 'POST',
                headers:{
                    'Authorization':`Bearer ${token}`,
                    'Content-Type':'application/json'
                },
            });
            metadata = await response.json();
        } catch (error){
            metadata = {
                id: crypto.randomUUID(),
                title: "Libreta sin titulo",
                paper:defaultPaper,
                author: {
                    name: user?.username || "Unknown",
                    id: user!.user_id
                },
                base_font_size: defaultFontSize,
                body_font_family: defaultFontFamily,
                page_layout:defaultLayout,
                header_font_family: defaultHeaderFontFamily,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }; 
            appStore.dispatch(addOfflineNotebookMetadata({...metadata, typeOfModification: 'added'}));
        }
        const notebook = NotebookOliva.newNotebookFromMetadata(metadata);
        saveLocalNotebook(notebook.oli());
        return notebook.metadata.id;
    } catch (error){
        console.error("Error creating new notebook:", error);
    }
}
export async function updateNotebook(notebook: NotebookOliva){
    const token = getToken();
    if (!token) {
        return;
    }
    notebook.setUpdatedAt(new Date());
    const metadata: Metadata = notebook.metadata;
    if(appStore.getState().onlineStatus.isOnline){
        try{
            const response = await fetch(`${apiBaseUrl}/notebooks/${metadata.id}`,{
                method: 'PUT',
                headers:{
                    'Authorization':`Bearer ${token}`,
                    'Content-Type':'application/json'
                },
                body: JSON.stringify(notebook)
            });
            if(!response.ok){
                throw new Error("Failed to update notebook online");
            }
            appStore.dispatch(addOnlineNotebookMetadata([{...metadata, updated_at: metadata.updated_at, created_at: metadata.created_at}]));
        } catch (error){
            console.error("Error updating notebook online:", error);
            appStore.dispatch(addOfflineNotebookMetadata({...metadata, updated_at: metadata.updated_at, created_at: metadata.created_at, typeOfModification: 'updated'}));
        }    
    } else {
        console.log("Offline mode, saving notebook update locally");
        appStore.dispatch(addOfflineNotebookMetadata({...metadata, updated_at: metadata.updated_at, created_at: metadata.created_at, typeOfModification: 'updated'}));
    }
    saveLocalNotebook(notebook.oli());
}
export async function deleteNotebook(notebookId: string){
    const token = getToken();
    if (!token) {
        return;
    }
    if(appStore.getState().onlineStatus.isOnline){
        try{
            const response = await fetch(`${apiBaseUrl}/notebooks/${notebookId}`,{
                method: 'DELETE',
                headers:{
                    'Authorization':`Bearer ${token}`,
                    'Content-Type':'application/json'
                },
            });
            if(!response.ok){
                throw new Error("Failed to delete notebook online");
            }
            if(appStore.getState().dataSync.downloadedNotebooks.includes(notebookId)) deleteLocalNotebook(notebookId);
            appStore.dispatch(deleteOnlineNotebookMetadata(notebookId));

        } catch (error){
            appStore.dispatch(deleteOfflineNotebookMetadata(notebookId));
            console.error("Error deleting notebook online:", error);
        }    
    } else {
        appStore.dispatch(deleteOfflineNotebookMetadata(notebookId));
    }
}
export async function syncOfflineNotebooks(){
    const token = getToken();
    if (!token) {
        return;
    }
    if (!appStore.getState().onlineStatus.isOnline){
        return;
    }
    const offlineModifications = appStore.getState().dataSync.offlineNotbooksModification;
    for(let modification of offlineModifications){
        try{
            const localNotebook = await readLocalNotebook(modification.id!);
            if(modification.typeOfModification === 'added'){
                const response = await fetch(`${apiBaseUrl}/notebooks/`,{
                    method: 'POST',
                    headers:{
                        'Authorization':`Bearer ${token}`,
                        'Content-Type':'application/json'
                    },
                    body: JSON.stringify(localNotebook)
                });
                if(!response.ok){
                    throw new Error("Failed to sync new notebook online");
                }
            } else if (modification.typeOfModification === 'updated'){
                updateNotebook(NotebookOliva.notebookFromJSON(localNotebook));
            } else if (modification.typeOfModification === 'deleted'){
                deleteNotebook(modification.id!);
            }
            appStore.dispatch(syncedNotebookModification(modification));
        } catch (error){
            console.error("Error syncing offline notebook:", error);
        }
    }
}
export async function getNotebook(notebookId:string){
    const token = getToken();
    if (!token) {
        throw new Error("No token available");
    }
    //Read local
    //Read from server if we are online
    //Compare updated_at dates
    //If local is older than server, keep local

    let localNotebook: Oli | null = null; 
    try {
        localNotebook =await readLocalNotebook(notebookId);
    } catch (error) {
        console.log("No local notebook found:", notebookId);
    }

    if(appStore.getState().onlineStatus.isOnline){
        try{
            const response = await fetch(`${apiBaseUrl}/notebooks/${notebookId}`,{
                method: 'GET',
                headers:{
                    'Authorization':`Bearer ${token}`,
                    'Content-Type':'application/json'
                }
            });

            let onlineNotebook = await response.json() as Oli;

            if(localNotebook){
                const localUpdatedAt = new Date(localNotebook.metadata.updated_at!);
                const onlineUpdatedAt = new Date(onlineNotebook.metadata.updated_at!);
                console.log("Comparing notebook dates, local:", localUpdatedAt, "online:", onlineUpdatedAt);
                if(localUpdatedAt >= onlineUpdatedAt){
                    console.log("Using local notebook, it's newer or same as online:", notebookId);
                    return localNotebook;
                } else {
                    console.log("Updating local notebook with online version:", notebookId);
                    saveLocalNotebook(onlineNotebook);
                    return onlineNotebook;
                }
            } else {
                console.log("Saving online notebook locally:", notebookId);
                saveLocalNotebook(onlineNotebook);
                return onlineNotebook;
            }
        } catch (error){
            if(localNotebook){
                console.log("Error fetching online notebook, using local version:", notebookId);
                return localNotebook;
            }
        }
    }else {
        if(localNotebook){
            console.log("Offline mode, using local notebook:", notebookId);
            return localNotebook;
        } else{
            throw new Error("Notebook not found locally and offline");
        }
    }
}

