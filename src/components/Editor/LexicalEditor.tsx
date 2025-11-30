import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import ToolbarPlugin from "../Toolbar";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { useSharedHistoryContext } from "./context/SharedHistoryContext";
import { AutoFocusPlugin } from "./LayoutPlugin/AutoFocusPlugin";
import { type LayoutTemplate } from "./LayoutPlugin/LayoutContainerNode";
import { useEffect, type JSX } from "react";
import MarkdownPlugin from "./MarkdownPlugin/MarkdownPlugin";
import EquationsPlugin from "./EquationPlugin/EquationsPlugin";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { CollaborationPlugin } from "@lexical/react/LexicalCollaborationPlugin";
import { createSyncronizationProvider } from "./collaborator/providers";
import PageBreakPlugin from "./PagePlugin/";
import { LayoutPlugin } from "./LayoutPlugin/LayoutPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import type { InitialEditorStateType } from "@lexical/react/LexicalComposer";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";



export default function LexicalEditor( { placeholder, template, aspectRatio, user, id, initialEditorState, shouldBootstrap } : { placeholder: string, template: LayoutTemplate, aspectRatio: number, user: string, id: string, initialEditorState?: InitialEditorStateType, shouldBootstrap?: boolean } ) : JSX.Element {
    const {historyState} = useSharedHistoryContext();
    const [editor] = useLexicalComposerContext();
    const username = useSelector((state: RootState) => state.auth.user?.username);
    useEffect(()=>{
        console.log("Editor: user or id changed", {user, id});
    },[user, id,]);

    return (!id ? <></>:
    <>
        <ToolbarPlugin />
        <div className="editor-container">
            <RichTextPlugin
                contentEditable={
                    <ContentEditable
                    placeholder={
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
            <CollaborationPlugin id={id} username={username} providerFactory={createSyncronizationProvider} shouldBootstrap={shouldBootstrap||false} initialEditorState={initialEditorState} />
            <HistoryPlugin externalHistoryState={historyState} />
            <LayoutPlugin template={template} aspectRatio={aspectRatio}/>
            <MarkdownPlugin />
            <EquationsPlugin />
        </div>
    </>    
    );
}