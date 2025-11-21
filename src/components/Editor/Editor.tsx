import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router";
import NotebookOliva from "../../OlivaFormat/src/Oliva";
import { getNotebook } from "../../hooks/useApi";
import type { RootState } from "../../store";
import { useSelector } from "react-redux";
import '../../styles/Editor.css';
import { useDispatch } from "react-redux";
import { setMetadata, setNotebookPixelsWidth } from "../../features/editor/editorSlice";
import { $createParagraphNode, $createTextNode, $getRoot, defineExtension, type EditorState, type LexicalEditor } from "lexical";
import ToolbarPlugin from "../Toolbar";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LayoutPlugin } from "./LayoutPlugin/LayoutPlugin";
import { LexicalExtensionComposer } from "@lexical/react/LexicalExtensionComposer";
import { OlivaNodes } from "./OlivaNodes";
import OlivaEditorTheme from './OlivaEditorTheme'
import { buildHTMLConfig } from "./buildHTMLConfig";
import { $createFilledLayoutContainer, $createLayoutContainerNode, type LayoutTemplate } from "./LayoutPlugin/LayoutContainerNode";
import * as React from 'react'
const cornellLayout:LayoutTemplate = {
    columns: '1fr 3fr', 
    rows: '5fr 1fr', 
    components:[
        { label: 'Notes', area: '1 / 1 / 2 / 2' },
        { label: 'Main', area: '1 / 2 / 2 / 3' },
        { label: 'Summary', area: '2 / 1 / 3 / 3' },
    ],
};

const placeholder = "Escribe aquí...";

const PointMM = 0.34;
function $firstLayout() {
    const root = $getRoot();
    console.log("Layout: "+ JSON.stringify(root.exportJSON()), null, 2);
    if(root.getFirstChild()===null){
        const layout = $createFilledLayoutContainer(cornellLayout);        
        root.append(layout);
    }
}

export default function Editor() {
    const [title, setTitle] = useState("");
    
    const app = useMemo(
        ()=> 
        defineExtension({
            $initialEditorState: $firstLayout,
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

    const notebookRef = useRef<HTMLDivElement>(null);

    const notebookPixelsWidth = useSelector((state:RootState) => state.editor.notebookPixelsWidth);
    const notebookMetadata = useSelector((state:RootState) => state.editor.metadata);

    const getFontSize = (pt:number) => {
        if (!notebookMetadata) return '16px';
        return pt*PointMM/notebookMetadata.paper.dimensions.width!*notebookPixelsWidth!;
    }
    const [update, setUpdate] = useState(false);
    useEffect(() => {

        getNotebook(notebookId!).then(data => {
            console.log("Fetched notebook data:", data);
            const notebookFetched = NotebookOliva.notebookFromJSON(data!);
            setNotebook(notebookFetched);
            dispatch(setMetadata(notebookFetched.metadata));
            setTitle(notebookFetched.metadata.title);
        }).catch(error => {
            console.error("Error fetching notebook:", error);
        });

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

    }, []);

    useEffect( () => {
        const fontSize = getFontSize(notebookMetadata?.base_font_size!);
        if (notebookRef.current) {
            notebookRef.current.style.fontSize = `${fontSize}px`;
        }
        const pages = document.getElementsByClassName('page');
        for (let i = 0; i < pages.length; i++) {
            const page = pages[i] as HTMLElement;
            page.style.width = `${notebookPixelsWidth}px`;
            page.style.height = `${notebookPixelsWidth! * (notebookMetadata!.paper.dimensions.height / notebookMetadata!.paper.dimensions.width)}px`;
        }

    }, [notebookPixelsWidth, update])
    return (
    <ErrorBoundary>
            <LexicalExtensionComposer extension={app} contentEditable={null}>
                
            <div className="editor">
                <ToolbarPlugin/>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="title titleMedium" />
                <section ref={notebookRef} className="editor-container" style={{
                    fontSize:`${getFontSize(notebookMetadata?.base_font_size!)}px`
                }}>
                    <RichTextPlugin
                        contentEditable={
                                    <ContentEditable placeholder={
                                            <div className="editor-placeholder">
                                                {placeholder}
                                            </div>
                                        } 
                                        className="notebook"
                                        aria-placeholder={placeholder}
                                    />
                        }
                        
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                    <HistoryPlugin/>
                    <AutoFocusPlugin/>
                    <LayoutPlugin/>
                    <OnChangePlugin onChange={()=> setUpdate(!update)}/>
                </section>
            </div>
                    </LexicalExtensionComposer>
    </ErrorBoundary>
        
    );
}

class ErrorBoundary extends React.Component<React.PropsWithChildren> {
    state:{hasError:boolean};
  constructor(props: React.PropsWithChildren ) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error:Error) {
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