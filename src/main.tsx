import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Provider } from 'react-redux'
import { appStore } from './hooks/useStoredContext.ts'

function Root(){
  return <Provider store={appStore}>
    <App/>
  </Provider>
}

createRoot(document.getElementById('root')!).render(
    <Root/>,
)
