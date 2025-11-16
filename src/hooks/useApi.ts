
export const apiBaseUrl = 'http://localhost:8080';
export const loginUrl = `${apiBaseUrl}/auth/login`;
export type User = {
    user_id: string;
    username: string;
    email: string;
    created_at: string;
    image_url?: string;
}
export type Paper = {
    name:string,
    width:number,
    height:number
}

export type Orientation = 'portrait' | 'landscape';

export type Notebook = {
    notebook_id: string;
    owner_id:string;
    title: string;
    paper: Paper;
    orientation?: Orientation;
    base_font_size?:number;
    body_font_family?:string;
    header_font_family?:string;
    file_uri?: string;
    created_at:Date;
    updated_at:Date;
}

export async function getUserData( token: string) {
    // Get to user data endpoint with the sub in the body
    return await fetch(`${apiBaseUrl}/api/user`, {
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
export async function getFile(token: string, fileId: string) {
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
        return fileData;
    });

    else return await fetch(fileId).then(async response => {
        if (!response.ok) {
            throw new Error('Failed to fetch file');
        }
        const fileData = await response.blob();
        return fileData;
    });
}

export async function getNotebooks (token:string){
    const response = await fetch(`${apiBaseUrl}/notebooks`,{
        method: 'GET',
        headers:{
            'Authorization':`Bearer ${token}`,
            'Content-Type':'application/json'
        }
    })
    const notebooks: Notebook[] = await response.json() as Notebook[];
    return notebooks;
}
export async function newNotebook(token:string){
    const response = await fetch(`${apiBaseUrl}/notebooks/new`,{
        method: 'POST',
        headers:{
            'Authorization':`Bearer ${token}`,
            'Content-Type':'application/json'
        },
    });
    const notebook: Notebook = await response.json() as Notebook;
    console.log("New notebook created:", notebook);
    return notebook;
} 
export function logoutUser(refreshToken: string) {
    window.location.href = `${apiBaseUrl}/auth/logout?refresh_token=${refreshToken}`;
}
