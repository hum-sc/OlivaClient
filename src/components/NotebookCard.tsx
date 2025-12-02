import { useDocument } from "@automerge/react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import type { MetadataList, Metadata } from "../features/dataSync/MetadataStore";
import type { RootState } from "../store";
import IconButton from "./IconButton";
import "../styles/components/NotebookCard.css";

export default function NotebookCard({metadata}: {metadata: Metadata}) {
    const navigate = useNavigate();
    const docUrl = useSelector((state: RootState) => state.dataSync.docUrl);
    const [doc, changeDoc] = useDocument<MetadataList>(docUrl,{
        suspense: true
    });

    const handleDeleteNotebook = (notebookID: string) => {
        const index = doc.metadata.findIndex((meta) => meta.notebookID === notebookID);
        if (index >= 0) {
            const id = doc.metadata[index].notebookID;
            indexedDB.deleteDatabase(id);            
            changeDoc(doc => {
                    doc.metadata.at(index)!.type = 'deleted';
            });
        }
    }
    const currentDate = new Date();
    const updatedAt = metadata.updatedAt ? new Date(metadata.updatedAt) : null;
    const formattedDate = updatedAt ? updatedAt.getDate() == currentDate.getDate() ? "Hoy" :
        updatedAt.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : "Nunca editada";
    return <div key={metadata.notebookID} className="notebookCard" onClick={() => navigate(`/editor/${metadata.notebookID}`)}>
            <div className="notebookCover">
                <span className="material-symbols-outlined coverIcon">book</span>
            </div>
            <div className='notebookData'>
                <div className="notebookInfo">
                <h3 className="titleSmall">{metadata.title || "Libreta sin título"}</h3>
                <p className="labelSmall">{metadata.updatedAt ? `Actualizado: ${formattedDate}` : "Nunca editada"}</p>
                </div>
                <IconButton className="delete" label='delete' size="small" icon='delete' onClick={(event) => { event.stopPropagation(); handleDeleteNotebook(metadata.notebookID); } } />
            </div>
            <div className="stateLayer"/>
         </div>;
}
