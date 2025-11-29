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
  network: [new BroadcastChannelNetworkAdapter()],
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
      const repo = new Repo({
        network: [
          new BroadcastChannelNetworkAdapter(), 
          new WebSocketClientAdapter("wss://sync.automerge.org"),
        ],
        storage: new IndexedDBStorageAdapter(),
      })
      let handle :DocHandle<MetadataList>;
      const locationHash = appStore.getState().dataSync.docUrl;
      if(isValidAutomergeUrl(locationHash)) {
        handle= await repo.find<MetadataList>(locationHash);
      } else {
        handle = await repo.create<MetadataList>(initMetadataList());
        appStore.dispatch(setDocUrl(handle.url));
      }
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
