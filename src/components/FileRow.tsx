import type { FileMetadata } from "../features/dataSync/MetadataStore";
import IconButton from "./IconButton";
import '../styles/components/FileRow.css'
import { useNavigate } from "react-router";
export default function FileRow({fileMetadata, onClick}:{fileMetadata:FileMetadata, onClick: (fileMetadata: FileMetadata) => void}) {
    const navigate = useNavigate();
    const handleDeleteFile = (fileID: string) => {
    };
    return <div key={fileMetadata.fileID} 
        className="fileRow" 
        onClick={() => onClick(fileMetadata)}>
            <div className="fileRowCover">
                <span className="material-symbols-outlined coverIcon">picture_as_pdf</span>
            </div>
            <div className="fileData">
                <div className="fileInfo">
                    <h3 className="titleSmall">{fileMetadata.filename || "Archivo sin nombre"}</h3>
                    <p className="labelSmall">{fileMetadata.fileSize ? `Tamaño: ${(fileMetadata.fileSize / 1024).toFixed(2)} KB` : "Tamaño desconocido"}</p>
                </div>
            </div>
            <div className="stateLayer"/>
        </div>;
}