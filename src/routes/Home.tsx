import { useDispatch, useSelector } from 'react-redux';
import '../styles/routes/Home.css';
import { useEffect } from 'react';
import type { RootState } from '../store.ts';
import { setActiveNav } from '../features/sidebar/sidebarSlice.ts';
import { type NavFab } from '../features/sidebar/sidebarSlice.ts';
import { useDocument } from '@automerge/react';
import type { MetadataList } from '../features/dataSync/MetadataStore.ts';
import NotebookCard from '../components/NotebookCard.tsx';
export default function Home() {
    const docUrl = useSelector((state: RootState) => state.dataSync.docUrl);
    const [doc, ] = useDocument<MetadataList>(docUrl,{
        suspense: true
    });
    const dispatch = useDispatch();
    const nav: NavFab = {
        text: "Nueva libreta",
        icon: "edit",
        action: "newNotebook"
    }

    
    
    useEffect( ()=>{
        dispatch(setActiveNav(nav));
        window.document.title = "Oliva - Inicio";
    },[]);
    return (<>
        <section className="myNotes">
            <h2 className="headlineMedium">
                Mis notas
            </h2>
            { doc&&doc.metadata.filter(meta => meta.type !== 'deleted').length === 0 ? <p className="bodyMedium">No tienes libretas creadas aún.</p> :
                <div className="notebooksContainer">
                    {doc && doc.metadata.filter(meta => meta.type !== 'deleted').map((metadata)=>{
                        return <NotebookCard key={metadata.notebookID} metadata={metadata} />
                        })
                    }
                    
                </div>
            }
        </section>
        </>
    );
}

