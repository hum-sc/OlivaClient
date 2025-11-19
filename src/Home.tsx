import { useDispatch, useSelector } from 'react-redux';
import { deleteNotebook, getNotebooksMetadata } from './hooks/useApi.ts';
import './styles/Home.css';
import { useEffect } from 'react';
import type { RootState } from './store.ts';
import { useNavigate } from 'react-router';
import { setActiveNav } from './features/sidebar/sidebarSlice.ts';
import {type NavFab } from './features/sidebar/sidebarSlice.ts';
import Button from './components/Button.tsx';
import IconButton from './components/IconButton.tsx';
export default function Home() {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector((state:RootState) => state.auth.isAuthenticated);
    const notebooksMetadata = useSelector((state:RootState) => state.dataSync.localNotebooksMetadata);
    const downloadedNotebooks = useSelector((state:RootState) => state.dataSync.downloadedNotebooks);
    const isOnline = useSelector((state:RootState) => state.onlineStatus.isOnline);
    const navigate = useNavigate();
    const nav: NavFab = {
        text: "Nueva libreta",
        icon: "edit",
        action: "newNotebook"
    }
    
    useEffect(()=>{
        dispatch(setActiveNav(nav));
        getNotebooksMetadata();
    },[isAuthenticated,])
    return (<>
        <section className="myNotes">
            <h2 className="headlineMedium">
                Mis notas
            </h2>
            { notebooksMetadata.length === 0 ? <p className="bodyMedium">No tienes libretas creadas aún.</p> :
                <div className="notebooksGrid">
                    {notebooksMetadata.map((notebook) => (
                        <div key={notebook.id} className="notebookCard" 
                        style={{
                            color: !isOnline&&!downloadedNotebooks.includes(notebook.id!) ? "gray":"rgb(var(--md-sys-color-on-surface)",
                        }}
                        >
                            <div className='NotebookData'
                            onClick={()=> isOnline||downloadedNotebooks.includes(notebook.id!) ? navigate(`/editor/${notebook.id!}`) : null}
                            >
                            <h3 className="titleMedium">{notebook.title || "Libreta sin título"}</h3>
                            <p className="bodySmall">{notebook.updated_at.toLocaleString() || "Sin actualización"}</p>
                            </div>
                            <IconButton label='delete' size="small" icon='delete' onClick={()=>{deleteNotebook(notebook.id!)}}/>
                        </div>
                    ))}
                </div>
            }
        </section>
        </>
    );
}