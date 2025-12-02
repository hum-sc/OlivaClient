import type { Provider, ProviderAwareness } from '@lexical/yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';
import { appStore } from '../../hooks/useStoredContext';
import { setConnected, setDisconnected } from '../../features/online/onlineSlice';
export default class SyncronizationProvider implements Provider{
    awareness: ProviderAwareness;
    wsProvider: WebsocketProvider;
    idbProvider: IndexeddbPersistence | null;
    constructor(path:string, doc:Y.Doc, id:string){
        this.wsProvider = new WebsocketProvider(path, id, doc, {
            connect: false,
        }); 
        this.idbProvider = null;
        this.awareness = this.wsProvider.awareness as unknown as ProviderAwareness;
        console.log("SyncronizationProvider: created", {path, id, doc});
        
    }
    connect() {
        this.idbProvider = new IndexeddbPersistence(this.wsProvider.roomname, this.wsProvider.doc);
        this.wsProvider.connect();
    }
    disconnect() {
        this.idbProvider?.destroy();
        this.wsProvider.disconnect();
    }
    on(event: string, callback: (...args: any[]) => void): void {
        if(event === "sync"){
            console.log("SyncronizationProvider: waiting for IDB sync");
            this.idbProvider?.whenSynced.then(()=>{
                console.log("SyncronizationProvider: IDB synced");
                callback(true);
            }); 
            this.wsProvider.on('sync', (isSynced: boolean) => {
                console.log("SyncronizationProvider: WS sync event", isSynced);
                callback(isSynced);
            });
        }
        if( event === 'status'){
            this.wsProvider.on('status', (status: {status:'connected' | 'disconnected' | 'connecting'}) => {
                if (status.status === 'connected'){
                    appStore.dispatch(setConnected());
                } else if (status.status === 'disconnected'){
                    appStore.dispatch(setDisconnected());
                } else if (status.status === 'connecting'){
                    appStore.dispatch(setDisconnected());
                }
                callback(status);
            });
        }
        this.wsProvider.on(event as any, callback);
    }
    off(event: string, callback: (...args: any[]) => void): void {
        this.wsProvider.off(event as any, callback);
    }
    

}