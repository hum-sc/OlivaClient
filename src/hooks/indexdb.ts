import { addDownloadedNotebook, removeDownloadedNotebook } from "../features/dataSync/dataSyncSlice";
import type { Oli } from "../OlivaFormat/oli";
import { appStore } from "./useStoredContext";

function openIndexedDB(): Promise<IDBDatabase> {
    let db: IDBDatabase;

    return new Promise((resolve, reject) => {
        const openOrCreateDB = indexedDB.open('OlivaDB', 1);
        openOrCreateDB.onerror = function (event) {
            console.error("IndexedDB error opening:", event);
            reject(event);
        };

        openOrCreateDB.onsuccess = function (event) {

            db = (event.target as IDBOpenDBRequest).result;
            resolve(db);
        };

        openOrCreateDB.onupgradeneeded = function (event) {

            db = (event.target as IDBOpenDBRequest).result;
            db.onerror = function (event) {
                console.error("IndexedDB error during upgrade:", event);
                reject(event);
            };
            // Create a table for Oli type notebooks id is in notebook.metadata.id
            const objectStore = db.createObjectStore('notebooks', { keyPath: 'metadata.id' });
            objectStore.createIndex('metadata', 'metadata', { unique: false });
            objectStore.createIndex('pages', 'pages', { unique: false });
            objectStore.createIndex('nbformat', 'nbformat', { unique: false });
            objectStore.createIndex('nbformat_minor', 'nbformat_minor', { unique: false });

            const fileObjectStore = db.createObjectStore('files', { keyPath: 'file_uri' });
            fileObjectStore.createIndex('data', 'data', { unique: false });
            fileObjectStore.createIndex('type', 'type', { unique: false });
            resolve(db);
        };
    });
}
export async function readLocalNotebook(notebookId: string): Promise<Oli> {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['notebooks'], 'readonly');
        const objectStore = transaction.objectStore('notebooks');
        const request = objectStore.get(notebookId);

        request.onsuccess = function (event) {
            const result = (event.target as IDBRequest).result;
            if (result) {
                resolve(result as Oli);
            } else {
                reject('Notebook not found in IndexedDB');
            }
        };

        request.onerror = function (event) {
            reject(event);
        };
    });
}
export async function saveLocalNotebook(notebook: Oli): Promise<void> {
    const db = await openIndexedDB();
    console.log("Saving notebook locally:", notebook.metadata.id!);
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['notebooks'], 'readwrite');
        const objectStore = transaction.objectStore('notebooks');
        const request = objectStore.put(notebook);

        request.onsuccess = function () {
            appStore.dispatch(addDownloadedNotebook(notebook.metadata.id!));
            resolve();
        };
        request.onerror = function (event) {
            reject(event);
        };
    });
}
export async function deleteLocalNotebook(notebookId: string): Promise<void> {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['notebooks'], 'readwrite');
        const objectStore = transaction.objectStore('notebooks');
        const request = objectStore.delete(notebookId);

        request.onsuccess = function () {
            appStore.dispatch(removeDownloadedNotebook(notebookId));
            resolve();
        };
        request.onerror = function (event) {
            reject(event);
        };
    });
}
