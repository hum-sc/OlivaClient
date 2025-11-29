import './styles/App.css'
import { useSelector } from 'react-redux'
import { BrowserRouter, Route, Routes } from 'react-router'
import Editor from './routes/Editor.tsx'
import Home from './routes/Home.tsx'
import Layout from './routes/Layout.tsx'
import { useEffect } from 'react'
import { disableOfflineByUser } from './features/online/onlineSlice.ts'

import PWABadge from './components/PWABadge.tsx'
import type { RootState } from './store.ts'
import { useDispatch } from 'react-redux'
import { setConnected, setDisconnected} from './features/online/onlineSlice.ts'
import { getUserData, loginUrl } from './hooks/useApi.ts'

import Button from './components/Button.tsx'
import { Logout } from './routes/Logout.tsx'


function App() {
  const isOnline = useSelector((state:RootState) => state.onlineStatus.isOnline);
  const isLoggedIn = useSelector((state:RootState) => state.auth.isAuthenticated);
  const isDarkMode = useSelector((state:RootState) => state.theme.theme);
  const dispatch = useDispatch();


  useEffect(()=>{
    let timeoutId: NodeJS.Timeout;
    window.addEventListener('online', () => {
      dispatch(setConnected());

    });
    window.addEventListener('offline', () => {
      dispatch(setDisconnected());
    });
    if (isOnline && !isLoggedIn) {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      if (token) {
        const tmp = async () => {
          await getUserData(token).then(()=> {
              window.history.replaceState({}, document.title, "/");
            // Delay reload to ensure state is updated
              timeoutId = setTimeout(() => {
                console.log("Reloading to update state after login");
                window.location.reload();
              }, 5);
          })
        };
        tmp();
      }
    }
    return () => { clearTimeout(timeoutId); }
  },[isLoggedIn, isOnline])

  useEffect(()=>{
    if (!isLoggedIn) {
      dispatch(disableOfflineByUser());
    }
  },[isLoggedIn])

  return (
    <div className={`app ${isDarkMode === 'dark' ? 'dark' : 'light'}`}>
    { !isLoggedIn  && <div className="loginOverlay">
        <h2 className="displayMedium onBackground">Inicia sesión para continuar</h2>
        <p className="bodyMedium">Debes iniciar sesión para acceder a las funciones de la aplicación.</p>
        { isOnline ?
            <Button onClick={()=>{
              window.location.href = loginUrl;
            }} text='Iniciar sesión' size='medium' />
            :
            <p className="bodySmall">Actualmente estás desconectado. Por favor, conéctate a Internet e inicia sesión para continuar.</p>
        }
    </div>
    }
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/files" element={<Home />} />
          <Route path='/editor/:notebookId' element={
              <Editor />
            } />
          <Route path='/logout' element={<Logout />} />
        </Route>
      </Routes>
      <PWABadge />
    </BrowserRouter>
    </div>
  )
}


export default App
