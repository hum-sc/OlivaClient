import { LexicalExtensionComposer } from "@lexical/react/LexicalExtensionComposer";
import { $addUpdateTag, $getRoot, defineExtension, HISTORY_MERGE_TAG } from "lexical";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";

import { useDocument } from "@automerge/react";
import { LexicalCollaboration } from '@lexical/react/LexicalCollaborationContext';
import { type LexicalEditor as LexicalEditorType } from "lexical";
import * as React from 'react';
import { $createFilledLayoutContainer, type LayoutTemplate } from "../components/Editor/LayoutPlugin/LayoutContainerNode";
import LexicalEditor from "../components/Editor/LexicalEditor";
import OlivaEditorTheme from '../components/Editor/OlivaEditorTheme';
import { OlivaNodes } from "../components/Editor/OlivaNodes";
import { buildHTMLConfig } from "../components/Editor/buildHTMLConfig";
import { SharedHistoryContext } from '../components/Editor/context/SharedHistoryContext';
import type { MetadataList } from "../features/dataSync/MetadataStore";
import type { RootState } from "../store";
import '../styles/routes/Editor.css';
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { collapseSidebar, expandSidebar } from "../features/sidebar/sidebarSlice";

export const cornellLayout:LayoutTemplate = {
    columns: '25% 75%', 
    rows: '80% 20%', 
    components:[
        { id: 'Main', area: '1 / 2 / 2 / 3' },
        { id: 'Notes', area: '1 / 1 / 2 / 2' },
        { id: 'Summary', area: '2 / 1 / 3 / 3' },
    ],
};
const placeholder = "Escribe aquí...";

const PointMM = 0.35;


export default function Editor() {
    const notebookId = useParams().notebookId;
    const app = useMemo(
        ()=> 
            defineExtension({
                $initialEditorState: null,
                html: buildHTMLConfig(),
                name:'Oliva editor',
                namespace: notebookId!,
                nodes:OlivaNodes,
                theme: OlivaEditorTheme
            }
        ),[]
    );

    const user = useSelector((state:RootState) => state.auth.user?.username);
    
    const docUrl = useSelector((state:RootState) => state.dataSync.docUrl);
    
    const [doc, changeDoc] = useDocument<MetadataList>(docUrl,{
        suspense: true
    });
    
    const [title, setTitle] = useState<string>( "Untitled Notebook");

    const [notebookPixelsWidth, setNotebookPixelsWidth] = useState<number|undefined>(undefined);
    const notebookRef = useRef<HTMLDivElement>(null);
    
    const metadata = useMemo(()=>{
        if(doc){
            const meta = doc.metadata.find(
                (meta) => meta.notebookID === notebookId
            );
            if (meta){
            setTitle(meta.title!);
            }
            return meta || undefined;
        }
        return undefined;
    }, [doc, docUrl, notebookId]);

    const aspectRatio = useMemo(()=>{
        let aspectRatio: number;
        aspectRatio = metadata?.paper?.dimensions.width! / metadata?.paper?.dimensions.height! || (297/210); // Default A4 ratio
        return metadata?.paper?.orientation === 'landscape' ? 1/aspectRatio : aspectRatio;
    },[metadata]);

    const fontSize = useMemo(()=>{
        let pt = metadata?.baseFontSize || 12;
        if (!metadata || !notebookPixelsWidth) return 16;
        return Math.trunc(pt*PointMM/metadata.paper!.dimensions.width!*notebookPixelsWidth!);
    },[metadata,notebookPixelsWidth!]);

    const onChangeTitle = useCallback((e:React.ChangeEvent<HTMLInputElement>)=>{
        setTitle(e.target.value);
        const newTitle = e.target.value;
        changeDoc(doc => {
            const meta = doc.metadata.find(
                (meta) => meta.notebookID === notebookId
            );
            if (meta){
                meta.title = newTitle;
                meta.updatedAt = new Date();
            }
        });
    }, [changeDoc, notebookId]);

    const initalEditor = (editor: LexicalEditorType) => {
        console.log("Bootstrapping editor layout");
        editor.update(()=>{
            $addUpdateTag(HISTORY_MERGE_TAG);
            const layout = $createFilledLayoutContainer(cornellLayout, aspectRatio);
            if($getRoot().getChildrenSize() == 0) {
                $getRoot().append(layout);
                layout.selectStart();
            }
        },{
            discrete: true
        })
    }

    useEffect(()=>{
        const current = notebookRef.current;
        if (current) {
            const resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    const width = entry.contentRect.width;
                    setNotebookPixelsWidth(width);
                }
            });
            resizeObserver.observe(current);
            return () => {
                resizeObserver.unobserve(current);
            };
        }
    },[]);

    useEffect(()=>{
        document.title = title + " - Oliva";
    }, [title]);
    const dispatch = useDispatch();
    useEffect(()=>{
        dispatch(collapseSidebar());
        return ()=>{dispatch(expandSidebar());}
    }, []);
    return metadata !==undefined ? (
    <ErrorBoundary>
        <LexicalCollaboration>
            <LexicalExtensionComposer extension={app} contentEditable={null}>   
                <SharedHistoryContext>
                    <div className="editor" ref={notebookRef} style={{
                        fontSize:fontSize
                        }}>
                        <input value={title} className="title titleMedium" onChange={(e)=>onChangeTitle(e)} />
                        <LexicalEditor 
                            placeholder={placeholder} 
                            template={cornellLayout} 
                            aspectRatio={aspectRatio}
                            user={user!}
                            id={notebookId!}
                            initialEditorState={initalEditor}
                            shouldBootstrap={true}
                        />
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