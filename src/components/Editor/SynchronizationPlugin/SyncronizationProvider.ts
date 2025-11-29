import type { Provider, ProviderAwareness } from '@lexical/yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';
export default class SyncronizationProvider implements Provider{
    awareness: ProviderAwareness;
    wsProvider: WebsocketProvider;
    idbProvider: IndexeddbPersistence;
    constructor(path:string, doc:Y.Doc, id:string){
        this.wsProvider = new WebsocketProvider(path, id, doc, {
            connect: false,
        });
        this.idbProvider = new IndexeddbPersistence(id, doc);
        this.awareness = this.wsProvider.awareness as unknown as ProviderAwareness;
    }
    connect() {
        this.idbProvider.whenSynced.then(() => {
            this.wsProvider.connect();
        });
        console.log("SyncProv: connect called");
    }
    disconnect() {
        this.idbProvider.destroy();
        this.wsProvider.disconnect();
        console.log("SyncProv: disconnect called");
    }
    on(event: string, callback: (...args: any[]) => void): void {
        console.log(`SyncProv: on called for event: ${event}`);
    }
    off(event: string, callback: (...args: any[]) => void): void {
        console.log(`SyncProv: off called for event: ${event}`);
    }

}