import { useSelector, useDispatch } from "react-redux";
import { Outlet, useNavigate } from "react-router";

import { enableDarkMode, disableDarkMode, ThemeMode } from "../features/theme/themeSlice";
import { handleIsOfflineByUser, setConnected, setDisconnected } from "../features/online/onlineSlice";
import IconButton from "../components/IconButton";
import { type RootState } from "../store";
import "../styles/routes/Layout.css";
import Avatar from "../components/Avatar";
import { createDefaultNotebookMetadata } from "../hooks/useApi";
import { useDocument, useRepo, WebSocketClientAdapter } from "@automerge/react";
import type { FileMetadata, MetadataList } from "../features/dataSync/MetadataStore";
import type { UUID } from "crypto";
import SideBar from "../components/SideBar";
import { useEffect } from "react";
import { appStore } from "../hooks/useStoredContext";
import { saveLocalFile } from "../hooks/indexeddb";

export default function Layout() {
    const docUrl = useSelector((state: RootState) => state.dataSync.docUrl);
    const repo = useRepo();

    const [, changeDoc] = useDocument<MetadataList>(docUrl,{
            suspense: true
    });
    const isOnline = useSelector((state: RootState) => state.onlineStatus.isOnline);
    const isDarkMode = useSelector((state: RootState) => state.theme.theme);
    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch();
    const navFAB = useSelector((state: RootState) => state.sidebar.navFAB);
    const navigate = useNavigate();

    const handleNewNotebook = async () => {
        const metadata = createDefaultNotebookMetadata(user!.user_id as UUID, "Libreta sin título");
        changeDoc(doc => {
            doc.metadata.unshift(metadata);
        });
        if (metadata.notebookID) {
            navigate(`/editor/${metadata.notebookID}`);
        }
    };
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
    const handleFABClick = async () => {
        switch (navFAB?.action){
            case "newNotebook":
                handleNewNotebook();
                break;
            case "newFile":
                handleNewFile();
                break;
        }

    }

    useEffect(()=>{
    repo.networkSubsystem.adapters.forEach(adapter => {
        if(adapter instanceof WebSocketClientAdapter){
            adapter.onOpen = ()=>{
                appStore.dispatch(setConnected());
            }
            adapter.onError = ()=>{
                appStore.dispatch(setDisconnected());
            }
            adapter.onClose = ()=>{
                appStore.dispatch(setDisconnected());
            }
            adapter.onMessage = ( event)=>{
                console.log("Message received from peer:", event);
            }
        }
    });
    },[repo])
    
    return (
        <div className={`appLayout ${isDarkMode === ThemeMode.dark ? 'dark' : 'light'}`}>
            <header>
                <div className="brand">
                    <img src="/logo.svg" alt="Logo"/>
                    <h1 className="displaySmall">Oliva</h1>
                </div>
                <div className="actions">
                    {
                        isOnline ?
                        <IconButton 
                            icon="wifi"
                            label="Online"
                            onClick={()=>dispatch(handleIsOfflineByUser())}
                        />
                        :
                        <IconButton 
                            icon="wifi_off"
                            label="Offline"
                            onClick={()=>dispatch(handleIsOfflineByUser())}
                        />
                    }
                    {
                        isDarkMode === ThemeMode.dark ?
                        <IconButton 
                            icon="light_mode"
                            label="Switch to Light Mode"
                            onClick={() => dispatch(disableDarkMode())}
                        />
                        :
                        <IconButton 
                            icon="dark_mode"
                            label="Switch to Dark Mode"
                            onClick={() => dispatch(enableDarkMode())}
                        />
                    }
                    <Avatar url={user?.image_url || "/defaultAvatar.png"} size={32}/>
                </div>
            </header>
            <SideBar navFAB={navFAB} handleFABClick={handleFABClick} />
            <main>
                <Outlet />
            </main>
        </div>
    );
}


