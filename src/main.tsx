import { createRoot } from 'react-dom/client'
import './styles/index.css'
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
