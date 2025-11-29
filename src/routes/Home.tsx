import { useDispatch, useSelector } from 'react-redux';
import { deleteNotebook, useGetNotebooksMetadata } from '../hooks/useApi.ts';
import '../styles/routes/Home.css';
import { useEffect } from 'react';
import type { RootState } from '../store.ts';
import { useNavigate } from 'react-router';
import { setActiveNav } from '../features/sidebar/sidebarSlice.ts';
import {type NavFab } from '../features/sidebar/sidebarSlice.ts';
import IconButton from '../components/IconButton.tsx';
import { useDocument } from '@automerge/react';
import type { MetadataList } from '../features/dataSync/MetadataStore.ts';
export default function Home() {
    const docUrl = useSelector((state: RootState) => state.dataSync.docUrl);
    const [doc, changeDoc] = useDocument<MetadataList>(docUrl,{
        suspense: true
    });
    const dispatch = useDispatch();
    const isOnline = useSelector((state:RootState) => state.onlineStatus.isOnline);
    const navigate = useNavigate();
    const nav: NavFab = {
        text: "Nueva libreta",
        icon: "edit",
        action: "newNotebook"
    }

    const handleDeleteNotebook = (notebookID: string) => {
        const index = doc.metadata.findIndex((meta) => meta.notebookID === notebookID);
        if (index >= 0) {
            changeDoc(doc => {
                doc.metadata.at(index)!.type = 'deleted';
            })
        }
    }
    
    useEffect( ()=>{
        dispatch(setActiveNav(nav));
        useGetNotebooksMetadata();
    },[]);
    return (<>
        <section className="myNotes">
            <h2 className="headlineMedium">
                Mis notas
            </h2>
            { doc.metadata.filter((metadata)=> metadata.type !== 'deleted').length === 0 ? <p className="bodyMedium">No tienes libretas creadas aún.</p> :
                <div className="notebooksGrid">
                    {doc && doc.metadata.filter((metadata)=> metadata.type !== 'deleted').map((metadata)=>{
                        return <div key={metadata.notebookID} className="notebookCard unsynced">
                            <div className='NotebookData'
                            onClick={()=> navigate(`/editor/${metadata.notebookID}`)}
                            >
                            <h3 className="titleMedium">{metadata.title || "Libreta sin título"}</h3>
                            </div>
                            <IconButton label='delete' size="small" icon='delete' onClick={()=>{handleDeleteNotebook(metadata.notebookID)}}/>
                        </div>
                        })
                    }
                    
                </div>
            }
        </section>
        </>
    );
}