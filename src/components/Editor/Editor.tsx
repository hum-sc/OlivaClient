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
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from '@lexical/markdown'
import EquationPlugin from "./EquationPlugin/EquationsPlugin";
const cornellLayout:LayoutTemplate = {
    columns: '25% 75%', 
    rows: '80% 20%', 
    components:[
        { id: 'Notes', area: '1 / 1 / 2 / 2' },
        { id: 'Main', area: '1 / 2 / 2 / 3' },
        { id: 'Summary', area: '2 / 1 / 3 / 3' },
    ],
};

const placeholder = "Escribe aquí...";

const PointMM = 0.34;
function $firstLayout() {
    const root = $getRoot();
    if(root.getFirstChild()===null){
        const layout = $createFilledLayoutContainer(cornellLayout);        
        root.append(layout);
        layout.selectStart();
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
        if (!notebookMetadata) return 16;
        return pt*PointMM/notebookMetadata.paper.dimensions.width!*notebookPixelsWidth!;
    }


    const {pageHeight, fontSize} = useMemo(()=>{
        let fontSize:number;
        let pageHeight:number;
        pageHeight = notebookPixelsWidth! * (notebookMetadata!.paper.dimensions.height / notebookMetadata!.paper.dimensions.width);
        fontSize = getFontSize(notebookMetadata?.base_font_size!);
        return {pageHeight, fontSize};

    },[notebookPixelsWidth, notebookMetadata]);

    useEffect(() => {
        getNotebook(notebookId!).then(data => {
            const notebookFetched = NotebookOliva.notebookFromJSON(data!);
            setNotebook(notebookFetched);
            dispatch(setMetadata(notebookFetched.metadata));
            setTitle(notebookFetched.metadata.title);
        }).catch(error => {
            console.error("Error fetching notebook:", error);
        });
    }, []);
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
    },[])
    useEffect(()=>{
        const pages = notebookRef.current?.getElementsByClassName('page')||[];
        for (let i = 0; i < pages.length; i++) {
            const page = pages[i] as HTMLElement;
            page.style.height = `${pageHeight}px`;
        }
    })
    return (
    <ErrorBoundary>
            <LexicalExtensionComposer extension={app} contentEditable={null}>
                
            <div className="editor">
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="title titleMedium" />
                <ToolbarPlugin/>
                <section ref={notebookRef} className="editor-container" style={{
                    fontSize:`${fontSize}px`
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
                    <MarkdownShortcutPlugin transformers={TRANSFORMERS}/>
                    <EquationPlugin/>
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