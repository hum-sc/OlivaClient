

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
            
            const fileObjectStore = db.createObjectStore('files', { keyPath: 'file_uri' });
            fileObjectStore.createIndex('data', 'data', { unique: false });
            fileObjectStore.createIndex('type', 'type', { unique: false });
            resolve(db);
        };
    });
}

export async function saveLocalFile(fileID: string, data: ArrayBuffer, type: string): Promise<void> {
    let db = await openIndexedDB();
    console.log("Saving file locally:", fileID);
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['files'], 'readwrite');
        const objectStore = transaction.objectStore('files');
        const request = objectStore.put({ file_uri: fileID, data, type });
        request.onsuccess = function () {
            resolve();
        };
        request.onerror = function (event) {
            reject(event);
        };
    });
}

export async function getLocalFile(fileID: string): Promise<{ data: ArrayBuffer, type: string } | null> {
    let db = await openIndexedDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['files'], 'readonly');
        const objectStore = transaction.objectStore('files');
        const request = objectStore.get(fileID);
        request.onsuccess = function (event) {
            const result = (event.target as IDBRequest).result;
            if (result) {
                resolve({ data: result.data, type: result.type });
            } else {
                resolve(null);
            }
        };
        request.onerror = function (event) {
            reject(event);
        };
    });
}
