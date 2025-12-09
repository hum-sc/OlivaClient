import { useParams } from "react-router";
import { getLocalFile } from "../hooks/indexeddb";
import { useEffect, useMemo, useState } from "react";
import { Viewer } from "@react-pdf-viewer/core";
import '@react-pdf-viewer/core/lib/styles/index.css';
import '../styles/routes/FileViewer.css';
export default function FileViewer(){
    const [fileStream, setFileStream] = useState<Blob | null>(null);
    const fileId = useParams().fileId;
    const file = useMemo(() => {
        if (fileId) {
            return getLocalFile(fileId);
        }
    }, [fileId]);

    useEffect(()=>{
        console.log("Fetching file for viewer:", fileId);
        file?.then((data)=>{
            const fileBlob: Blob = new Blob([data!.data], { type: 'application/pdf' });
            setFileStream(fileBlob);
        })
    },[file]);
    return <section className="viewer">
        <div className="viewer-container">
        {fileStream ?  <Viewer fileUrl={fileStream ? URL.createObjectURL(fileStream) : ""} />: <div>Cargando archivo...</div>}
        </div>
        </section>;
}