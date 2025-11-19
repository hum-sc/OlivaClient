import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import NotebookOliva from "./OlivaFormat/src/Oliva";
import { getNotebook, updateNotebook } from "./hooks/useApi";
import type { RootState } from "./store";
import { useSelector } from "react-redux";
import Page from "./components/Page";
import './styles/Editor.css';
import { useDispatch } from "react-redux";
import { setMetadata, setNotebookPixelsWidth } from "./features/editor/editorSlice";
import Button from "./components/Button";

const PointMM = 0.34;

export default function Editor() {
    const notebookId = useParams().notebookId;
    const [notebook, setNotebook] = useState<NotebookOliva | null>(null);
    const dispatch = useDispatch();

    const notebookRef = useRef<HTMLDivElement>(null);


    const notebookPixelsWidth = useSelector((state:RootState) => state.editor.notebookPixelsWidth);
    const notebookMetadata = useSelector((state:RootState) => state.editor.metadata);
    
    
    const getFontSize = (pt:number) => {
        if (!notebookMetadata) return '16px';
        return pt*PointMM/notebookMetadata.paper?.dimensions?.width!*notebookPixelsWidth!;
    }
    useEffect(() => {
        // Fetch notebook data based on notebookId
        getNotebook(notebookId!).then(data => {
            const notebookFetched = NotebookOliva.notebookFromJSON(data!);
            setNotebook(notebookFetched);
            dispatch(setMetadata(notebookFetched.metadata));
        }).catch(error => {
            console.error("Error fetching notebook:", error);
        });

        const current = notebookRef.current;
        if (current) {
            const resizeObserver = new ResizeObserver((entries) => {
                for (let entry of entries) {
                    const width = entry.contentRect.width;
                    dispatch(setNotebookPixelsWidth(width));
                }
            });
            resizeObserver.observe(current);
            return () => {
                resizeObserver.unobserve(current);
            };
        }

    }, []);
    return (
            <div className="editor">
                <h1 className="displayMedium">{notebook?.metadata.title}</h1>
                <Button text="Guardar cambios" icon="save" onClick={() => {
                    if (notebook) {
                        const copy = notebook.serialize();
                        updateNotebook(NotebookOliva.notebookFromString(copy));
                    }
                }} />
                <section ref={notebookRef} className="notebook" style={{
                    fontSize:`${getFontSize(notebookMetadata?.base_font_size!)}px`
                }}>
                    {
                        notebook && notebook.pages.map((page, index) => (
                            <Page key={index} page={page}/>
                        ))
                    }
                </section>
            </div>
    );
}