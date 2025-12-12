import type { FileMetadata } from "../features/dataSync/MetadataStore";
import '../styles/components/FileRow.css';
export default function FileRow({fileMetadata, onClick}:{fileMetadata:FileMetadata, onClick: (fileMetadata: FileMetadata) => void}) {
    
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