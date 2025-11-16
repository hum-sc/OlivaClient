import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Provider } from 'react-redux'
import useStoredContext from './hooks/useStoredContext.ts'

function Root(){
  const appStore = useStoredContext();
  return <Provider store={appStore}>
    <App/>
  </Provider>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root/>
  </StrictMode>,
)
