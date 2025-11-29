import type { Provider, ProviderAwareness } from '@lexical/yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';
export default class SyncronizationProvider implements Provider{
    awareness: ProviderAwareness;
    wsProvider: WebsocketProvider;
    constructor(path:string, doc:Y.Doc, id:string){
        this.wsProvider = new WebsocketProvider(path, id, doc, {
            connect: false,
        });  
        this.awareness = this.wsProvider.awareness as unknown as ProviderAwareness;
    }
    connect() {
        const idbProvider = new IndexeddbPersistence(this.wsProvider.roomname, this.wsProvider.doc);
        this.wsProvider.connect();
    }
    disconnect() {
        this.wsProvider.disconnect();
    }
    on(event: string, callback: (...args: any[]) => void): void {
        console.log(`SyncProv: on called for event: ${event}`);
        this.wsProvider.on(event as any, callback);
    }
    off(event: string, callback: (...args: any[]) => void): void {
        console.log(`SyncProv: off called for event: ${event}`);
        this.wsProvider.off(event as any, callback);
    }
    

}