import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.tsx'
import { Provider } from 'react-redux'
import { appStore } from './hooks/useStoredContext.ts'

import {
  Repo,
  BroadcastChannelNetworkAdapter,
  IndexedDBStorageAdapter,
  DocHandle,
  isValidAutomergeUrl,
  RepoContext,
  WebSocketClientAdapter
} from '@automerge/react'
import { initMetadataList, type MetadataList } from './features/dataSync/MetadataStore.ts'
import { Suspense, useEffect } from 'react'
import { setDocUrl } from './features/dataSync/dataSyncSlice.ts'

const repo = new Repo({
  network: [new WebSocketClientAdapter('ws://localhost:8081'),],
  storage: new IndexedDBStorageAdapter(),
})

declare global {
  interface Window {
    repo: Repo;
    handle: DocHandle<MetadataList>;
  }
}

window.repo = repo;

function Root(){
  useEffect(()=>{
    const initRepo = async () => {
      const locationHash = appStore.getState().dataSync.docUrl;
      if(isValidAutomergeUrl(locationHash)) {
        window.handle= await repo.find<MetadataList>(locationHash);
      } else {
        console.log("Creating new MetadataList document");
        window.handle = await repo.create<MetadataList>(initMetadataList());
        appStore.dispatch(setDocUrl(window.handle.url));
      }
      // Ferify if metadata and files arrays exist
      window.handle.change(doc => {
        if (!doc.metadata) {
          doc.metadata = [];
        }
        if (!doc.files) {
          doc.files = [];
        }
      });
    }
    initRepo();
  }, []);
  return <Provider store={appStore}>
    <Suspense fallback={<div>Loading...</div>}>
      <RepoContext.Provider value={repo}>
        <App />
      </RepoContext.Provider>
    </Suspense>
  </Provider>
}

createRoot(document.getElementById('root')!).render(
    <Root/>,
)
