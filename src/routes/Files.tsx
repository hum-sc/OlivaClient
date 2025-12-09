import { useDocument } from "@automerge/react";
import { useDispatch, useSelector } from "react-redux";
import type { MetadataList } from "../features/dataSync/MetadataStore";
import { setActiveNav, type NavFab } from "../features/sidebar/sidebarSlice";
import type { RootState } from "../store";
import { useEffect } from "react";
import "../styles/routes/Files.css";
import FileCard from "../components/FileCard";

export default function Files(){
    const docUrl = useSelector((state: RootState) => state.dataSync.docUrl);
    const [doc, ] = useDocument<MetadataList>(docUrl,{
        suspense: true
    });
    console.log("Files doc:", doc);
    const dispatch = useDispatch();
    const nav: NavFab = {
        text: "Subir archivo",
        icon: "upload",
        action: "newFile"
    }
    useEffect(()=>{
        dispatch(setActiveNav(nav));
        window.document.title = "Oliva - Archivos";
    },[]);
    return <>
    <section className="myFiles">
        <h2 className="headlineMedium">
            Mis archivos
        </h2>
        { doc.files.filter(file => file.type !== 'deleted').length === 0 ? <p className="bodyMedium">No tienes archivos subidos aún.</p> :
            <div className="filesContainer">
                {doc && doc.files.filter(file => file.type !== 'deleted').map((fileMetadata)=>{
                    return <FileCard key={fileMetadata.fileID} fileMetadata={fileMetadata} />
                })
                }
            </div>
        }

    </section>
    </>
}