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

// Helper function for authenticated API requests
async function fetchWithAuth(url: string, method: string = 'GET', body?: unknown): Promise<Response> {
    const token = getToken();
    const options: RequestInit = {
        method,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
    
    if (body) {
        options.body = JSON.stringify(body);
    }
    const timeout = 1000; // 1 seconds timeout
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeout);
    options.signal = controller.signal;
    
    return fetch(url, options);
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
export function logoutUser() {
    const token = getToken();
    window.location.href = `${apiBaseUrl}/auth/logout?token=${token}`;
}
export async function getFile(fileId: string) {
    //TODO: Cache files locally using IndexedDB
    if(!appStore.getState().onlineStatus.isOnline){
        throw new Error("Offline mode, cannot fetch file");
    }
    
    let url: string;
    let useAuth = false;
    
    if(fileId.startsWith(apiBaseUrl)) {
        url = fileId;
        useAuth = true;
    } else if (fileId.startsWith('http')) {
        url = fileId;
        useAuth = false;
    } else {
        url = `${apiBaseUrl}/files/${fileId}`;
        useAuth = true;
    }
    
    const response = useAuth 
        ? await fetchWithAuth(url, 'GET')
        : await fetch(url);
    
    if (!response.ok) {
        throw new Error('Failed to fetch file');
    }
    
    return await response.blob();
}
export async function getNotebooksMetadata (){
    try{
        if(!appStore.getState().onlineStatus.isOnline) return;
        
        const response = await fetchWithAuth(`${apiBaseUrl}/notebooks/`, 'GET');
        
        const newOnlineNotebooks: Metadata[] = await response.json();
        console.log("Fetched online notebooks metadata:", newOnlineNotebooks.length);
        appStore.dispatch(addOnlineNotebookMetadata(newOnlineNotebooks));
    } catch {
        return;
    }
}
export async function newNotebook(){
    console.log("Creating new notebook");
    const user = appStore.getState().auth.user;
    try{
        const isOnline = appStore.getState().onlineStatus.isOnline;
        let metadata: Metadata;
        try{
            if(!isOnline) throw new Error("Offline mode");
            console.log("Creating notebook online");
            const response = await fetchWithAuth(`${apiBaseUrl}/notebooks/new`, 'POST');
            metadata = await response.json();
        } catch {
            console.log("Offline mode, creating notebook locally");
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
            const response = await fetchWithAuth(`${apiBaseUrl}/notebooks/${metadata.id}`, 'PUT', notebook);
            if(!response.ok){
                throw new Error("Failed to update notebook online");
            }
            appStore.dispatch(addOnlineNotebookMetadata([{...metadata}]));
        } catch (error){
            console.error("Error updating notebook online:", error);
            appStore.dispatch(addOfflineNotebookMetadata({...metadata, typeOfModification: 'updated'}));
        }    
    } else {
        console.log("Offline mode, saving notebook update locally");
        appStore.dispatch(addOfflineNotebookMetadata({...metadata, typeOfModification: 'updated'}));
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
            const response = await fetchWithAuth(`${apiBaseUrl}/notebooks/${notebookId}`, 'DELETE');
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
export async function uploadNotebook(notebook: NotebookOliva){
    const token = getToken();
    if (!token) {
        return;
    }

    notebook.metadata.id = crypto.randomUUID();
    notebook.metadata.author = {
        name: appStore.getState().auth.user?.username || "Unknown",
        id: appStore.getState().auth.user!.user_id
    }
    if(!notebook.metadata.created_at){
        notebook.metadata.created_at = new Date().toISOString();
    }
    if(!notebook.metadata.updated_at){
        notebook.metadata.updated_at = new Date().toISOString();
    }
    const metadata: Metadata = notebook.metadata;
    
    if(appStore.getState().onlineStatus.isOnline){
        try{
            const response = await fetchWithAuth(`${apiBaseUrl}/notebooks/`, 'POST', notebook.oli());
            if(!response.ok){
                throw new Error("Failed to upload notebook online");
            }
            appStore.dispatch(addOnlineNotebookMetadata([{...metadata}]));
        } catch (error){
            console.error("Error uploading notebook online:", error);
            appStore.dispatch(addOfflineNotebookMetadata({...metadata, typeOfModification: 'added'}));
        }    
    } else {
        console.log("Offline mode, saving notebook upload locally");
        appStore.dispatch(addOfflineNotebookMetadata({...metadata, typeOfModification: 'added'}));
    }
    saveLocalNotebook(notebook.oli());
}
export async function syncOfflineNotebooks(){
    const token = getToken();
    const isOnline = appStore.getState().onlineStatus.isOnline;
    if (!token) {
        return;
    }
    if (!appStore.getState().onlineStatus.isOnline){
        return;
    }
    const offlineModifications = appStore.getState().dataSync.offlineNotbooksModification;
    if(!isOnline) throw new Error("Went offline during sync");
    for(const modification of offlineModifications){
        try{
            const localNotebook = await readLocalNotebook(modification.id!);
            if(modification.typeOfModification === 'added'){
                await uploadNotebook(NotebookOliva.notebookFromJSON(localNotebook));
            } else if (modification.typeOfModification === 'updated'){
                await updateNotebook(NotebookOliva.notebookFromJSON(localNotebook));
            } else if (modification.typeOfModification === 'deleted'){
                await deleteNotebook(modification.id!);
            }
            appStore.dispatch(syncedNotebookModification(modification));
        } catch (error){
            console.error("Error syncing offline notebook:", modification.id);
        }
    }
}
export async function getNotebook(notebookId:string){
    console.log("Getting notebook:", notebookId);
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
        console.log("Found local notebook:", notebookId);
    } catch {
        console.log("No local notebook found:", notebookId);
    }

    if(appStore.getState().onlineStatus.isOnline){
        try{
            const response = await fetchWithAuth(`${apiBaseUrl}/notebooks/${notebookId}`, 'GET');

            const onlineNotebook = await response.json() as Oli;

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
        } catch {
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

