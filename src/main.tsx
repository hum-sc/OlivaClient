import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.tsx'
import { Provider } from 'react-redux'
import { appStore } from './hooks/useStoredContext.ts'

import {
  Repo, IndexedDBStorageAdapter,
  DocHandle,
  isValidAutomergeUrl,
  RepoContext,
  WebSocketClientAdapter,
  type RepoConfig
} from '@automerge/react'
import { initMetadataList, type MetadataList } from './features/dataSync/MetadataStore.ts'
import { Suspense, useEffect } from 'react'
import { setDocUrl } from './features/dataSync/dataSyncSlice.ts'

const idFactory: RepoConfig['idFactory'] = () => {
  return new Promise((resolve) => {
    const id = appStore.getState().auth.user?.user_id;
    const encoder = new TextEncoder();
    resolve(id ? encoder.encode(id.toString()) : encoder.encode(""));
  })
}
const repo = new Repo({
  network: [new WebSocketClientAdapter(import.meta.env.VITE_WS_AUTOMERGE),],
  storage: new IndexedDBStorageAdapter('oliva-client-db', 'automerge-docs'),
  idFactory
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
      console.log("Location hash:", locationHash);
      if(isValidAutomergeUrl(locationHash)) {
        console.log("Finding existing MetadataList document");
        window.handle= await repo.find<MetadataList>(locationHash);
      } else {
        console.log("Creating new MetadataList document");
        window.handle = await repo.create2<MetadataList>(initMetadataList());
        if(appStore.getState().auth.user){
        appStore.dispatch(setDocUrl(window.handle.url));
        }
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
