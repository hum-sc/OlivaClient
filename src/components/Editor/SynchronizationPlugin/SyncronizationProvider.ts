import type { Provider, ProviderAwareness } from '@lexical/yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';
export default class SyncronizationProvider implements Provider{
    awareness: ProviderAwareness;
    wsProvider: WebsocketProvider;
    idbProvider: IndexeddbPersistence | null = null;
    constructor(path:string, doc:Y.Doc, id:string){
        this.wsProvider = new WebsocketProvider(path, id, doc, {
            connect: false,
        }); 
        this.awareness = this.wsProvider.awareness as unknown as ProviderAwareness;
    }
    connect() {
        this.idbProvider = new IndexeddbPersistence(this.wsProvider.roomname, this.wsProvider.doc);
        this.wsProvider.connect();
    }
    disconnect() {
        this.wsProvider.disconnect();
    }
    on(event: string, callback: (...args: any[]) => void): void {
        if(event === "sync"){
            this.idbProvider?.whenSynced.then(()=>{
                callback(true);
            });
            return;   
        }
        this.wsProvider.on(event as any, callback);
    }
    off(event: string, callback: (...args: any[]) => void): void {
        this.wsProvider.off(event as any, callback);
    }
    

}