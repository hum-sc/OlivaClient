import { login } from "../features/auth/authSlice";
import { type Metadata } from "../OlivaFormat/src/Oliva";
import { appStore } from "./useStoredContext";
import { type Metadata as MetadataStore } from '../features/dataSync/MetadataStore.ts';
import type { UUID } from "crypto";
import type { LayoutTemplate } from "../components/Editor/LayoutPlugin/LayoutContainerNode.tsx";
export const apiBaseUrl = 'http://localhost:8080';
export const loginUrl = `${apiBaseUrl}/auth/login`;

export const totalNumberofColumns = 3;
export const totalNumberofRows = 5;
export const cueColumns = 1;
export const summaryRows = 1;


export const defaultPaper: Metadata["paper"] = {
    dimensions: {
        width: 210,
        height: 297,
        name: "A4"
    },
    orientation: "portrait"
};

export const defaultLayout:LayoutTemplate = {
    columns: '25% 75%', 
    rows: '80% 20%', 
    components:[
        { id: 'Notes', area: '1 / 1 / 2 / 2' },
        { id: 'Main', area: '1 / 2 / 2 / 3' },
        { id: 'Summary', area: '2 / 1 / 3 / 2' },
    ],
};
export const defaultFontSize = 12;
export const defaultFontFamily: Metadata["body_font_family"] = {
    name: "Inter",
    generic_family: "sans-serif",
    url: "https://fonts.googleapis.com/css2?family=Inter&display=swap"
}
export const defaultHeaderFontFamily: Metadata["header_font_family"] = {
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


export const createDefaultNotebookMetadata = (authorId: UUID, title?: string): MetadataStore => {
    return {
        notebookID: crypto.randomUUID(),
        ownerId: authorId,
        title: title || "Libreta sin título",
        paper: defaultPaper,
        baseFontSize: defaultFontSize,
        bodyFontFamily: defaultFontFamily,
        headerFontFamily: defaultHeaderFontFamily,
        pageLayout: defaultLayout,
        createdAt: new Date(),
        type: "post"
    };
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
    const timeout = 500; // 1 seconds timeout
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

