import { useDocument } from "@automerge/react";
import type { FileMetadata, MetadataList } from "../features/dataSync/MetadataStore";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { useEffect, useMemo, useState } from "react";
import { getLocalFile, saveLocalFile } from "../hooks/indexeddb";
import FileRow from "./FileRow";
import { Viewer } from "@react-pdf-viewer/core";
import '../styles/components/FileViewerPanel.css';
import FAB from "./FAB";
import type { UUID } from "crypto";

export default function FileViewer (){
    const docUrl = useSelector((state:RootState) => state.dataSync.docUrl);
    
    const [doc, changeDoc] = useDocument<MetadataList>(docUrl,{
            suspense: true
    });
    const files = doc.files;
    const [fileId, setFileId] = useState<string|null>(null);
    const file = useMemo(()=>{
        if(fileId){
            return getLocalFile(fileId);
        }
    },[fileId])
    const [fileStream, setFileStream] = useState<Blob | null>(null);
    useEffect(()=>{
        file?.then((data)=>{
            const fileBlob = new Blob([data!.data], {type:'application/pdf'});
            setFileStream(fileBlob);
        });
        console.log("File changed");
    },[file])
    
    const onFileClick = (fileMetadata: FileMetadata) => {
        setFileId(fileMetadata.fileID);
    }

    async function handleNewFile() {
            // Opens file dialog only for pdfs
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'application/pdf';
            input.onchange = async (e: Event) => {
                const target = e.target as HTMLInputElement;
                if (target.files && target.files.length > 0) {
                    const file = target.files[0];
                    // Here you would handle the file upload and metadata creation
                    console.log("Selected file:", file.name);
                    const fileMetadata: FileMetadata = {
                        type: 'post',
                        fileID: crypto.randomUUID() as UUID,
                        filename: input.files ? input.files[0].name : undefined,
                        fileType: input.files ? input.files[0].type : undefined,
                        fileSize: input.files ? input.files[0].size : undefined,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    };
                    console.log("File metadata to store:", fileMetadata);
                    // Read the pdf
                    const reader = new FileReader();
                    reader.onload = function (event) {
                        const arrayBuffer = event.target?.result;
                        console.log("File array buffer:", arrayBuffer);
                        // Here you would typically upload the file to a server or store it in your app's state
                        saveLocalFile(fileMetadata.fileID, arrayBuffer as ArrayBuffer, fileMetadata.fileType || 'application/pdf').then(() => {
                            changeDoc(doc => {
                                doc.files.unshift(fileMetadata);
                            });
                        });
                    };
                    reader.readAsArrayBuffer(file);
    
                }
            };
            input.click();
        }
    return<div className="file-panel">
        { fileStream 
        ? <>
        <Viewer fileUrl={fileStream ? URL.createObjectURL(fileStream) : ""} />
        </>
        :<>
            <h3 className="labelLarge">Selecciona un documento</h3>
            { files 
            ? files.map((file)=><FileRow fileMetadata={file} onClick={onFileClick}/>)
            : <p>No hay archivos</p>

            }
            <FAB icon="add" expanded={false} onClick={handleNewFile}/>
        </>

        }
    </div>
}