import { LexicalExtensionComposer } from "@lexical/react/LexicalExtensionComposer";
import { defineExtension } from "lexical";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import NotebookOliva from "../OlivaFormat/src/Oliva";
import { setMetadata, setNotebookPixelsWidth } from "../features/editor/editorSlice";
import { getNotebook, type User } from "../hooks/useApi";
import type { RootState } from "../store";
import '../styles/routes/Editor.css';
import { type LayoutTemplate } from "../components/Editor/LayoutPlugin/LayoutContainerNode";
import OlivaEditorTheme from '../components/Editor/OlivaEditorTheme';
import { OlivaNodes } from "../components/Editor/OlivaNodes";
import { buildHTMLConfig } from "../components/Editor/buildHTMLConfig";
import { SharedHistoryContext } from '../components/Editor/context/SharedHistoryContext';
import { LexicalCollaboration } from '@lexical/react/LexicalCollaborationContext';
import LexicalEditor from "../components/Editor/LexicalEditor";
import * as React from 'react';
const cornellLayout:LayoutTemplate = {
    columns: '25% 75%', 
    rows: '80% 20%', 
    components:[
        { id: 'Notes', area: '1 / 1 / 2 / 2' },
        { id: 'Main', area: '1 / 2 / 2 / 3' },
        { id: 'Summary', area: '2 / 1 / 3 / 2' },
    ],
};
const placeholder = "Escribe aquí...";

const PointMM = 0.34;


export default function Editor() {
    const [title, setTitle] = useState("");
    const app = useMemo(
        ()=> 
        defineExtension({
            $initialEditorState: null,
            html: buildHTMLConfig(),
            name:'Oliva editor',
            namespace: 'Oliva',
            nodes:OlivaNodes,
            theme: OlivaEditorTheme
        }),
        []
    );
    const notebookId = useParams().notebookId;
    const [notebook, setNotebook] = useState<NotebookOliva | null>(null);
    const dispatch = useDispatch();

    notebook;
    const notebookRef = useRef<HTMLDivElement>(null);

    const notebookPixelsWidth = useSelector((state:RootState) => state.editor.notebookPixelsWidth);
    const notebookMetadata = useSelector((state:RootState) => state.editor.metadata);

    const getFontSize = (pt:number) => {
        if (!notebookMetadata) return 16;
        return Math.trunc(pt*PointMM/notebookMetadata.paper.dimensions.width!*notebookPixelsWidth!);
    }

    useEffect(() => {
        getNotebook(notebookId!).then((data: any) => {
            const notebookFetched = NotebookOliva.notebookFromJSON(data!);
            setNotebook(notebookFetched);
            dispatch(setMetadata(notebookFetched.metadata));
            setTitle(notebookFetched.metadata.title);
        }).catch((error: any) => {
            console.error("Error fetching notebook:", error);
        });
        return () => {
            dispatch(setMetadata(null));
        }
    }, []);
    const aspectRatio = useMemo(()=>{
        let aspectRatio: number;
        aspectRatio = notebookMetadata?.paper.dimensions.width! / notebookMetadata?.paper.dimensions.height! || (297/210); // Default A4 ratio
        return notebookMetadata?.paper.orientation === 'landscape' ? 1/aspectRatio : aspectRatio;
    },[notebookMetadata]);

    const fontSize = useMemo(()=>{
        let fontSize:number;
        fontSize = getFontSize(notebookMetadata?.base_font_size!);
        return fontSize;
    },[notebookMetadata, Math.trunc(notebookPixelsWidth!) % 2]);

    useEffect(()=>{
        const current = notebookRef.current;
        if (current) {
            const resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    const width = entry.contentRect.width;
                    dispatch(setNotebookPixelsWidth(width));
                }
            });
            resizeObserver.observe(current);
            return () => {
                resizeObserver.unobserve(current);
            };
        }
    },[]);
    return notebookMetadata ? (
    <ErrorBoundary>
        <LexicalCollaboration>
            <LexicalExtensionComposer extension={app} contentEditable={null}>   
                <SharedHistoryContext>
                    <div className="editor" style={{fontSize:fontSize}}>
                        <input value={title} onChange={(e) => setTitle(e.target.value)} className="title titleMedium" />
                        <LexicalEditor placeholder={placeholder} template={cornellLayout} aspectRatio={aspectRatio}/>
                    </div>
                </SharedHistoryContext>
            </LexicalExtensionComposer>
        </LexicalCollaboration>
    </ErrorBoundary>
        
    ):(<div>Loading...</div>);
}

class ErrorBoundary extends React.Component<React.PropsWithChildren> {
    state:{hasError:boolean};
  constructor(props: React.PropsWithChildren ) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error:Error) {
    console.error("Derived state from error: ", error);
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error:Error, info:any) {
    console.error("Error: ",
      error,
      // Example "componentStack":
      //   in ComponentThatThrows (created by App)
      //   in ErrorBoundary (created by App)
      //   in div (created by App)
      //   in App
      info.componentStack,
      // Warning: `captureOwnerStack` is not available in production.
      React.captureOwnerStack(),
    );
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h2> Something went wrong. </h2>;
    }
    return this.props.children;
  }
}