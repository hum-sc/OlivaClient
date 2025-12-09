import type { FileMetadata } from "../features/dataSync/MetadataStore";
import IconButton from "./IconButton";
import '../styles/components/FileCard.css'
import { useNavigate, useNavigation } from "react-router";
export default function FileCard({fileMetadata}:{fileMetadata:FileMetadata}) {
    const navigate = useNavigate();
    const handleDeleteFile = (fileID: string) => {
    };
    return <div key={fileMetadata.fileID} 
        className="fileCard" 
        onClick={()=>{navigate(`/fileviewer/${fileMetadata.fileID}`)}}>
            <div className="fileCover">
                <span className="material-symbols-outlined coverIcon">picture_as_pdf</span>
            </div>
            <div className="fileData">
                <div className="fileInfo">
                    <h3 className="titleSmall">{fileMetadata.filename || "Archivo sin nombre"}</h3>
                    <p className="labelSmall">{fileMetadata.fileSize ? `Tamaño: ${(fileMetadata.fileSize / 1024).toFixed(2)} KB` : "Tamaño desconocido"}</p>
                </div>
                <IconButton className="delete" label='delete' size="small" icon='delete' onClick={(event) => { event.stopPropagation(); handleDeleteFile(fileMetadata.fileID); } } />
            </div>
            <div className="stateLayer"/>
        </div>;
}