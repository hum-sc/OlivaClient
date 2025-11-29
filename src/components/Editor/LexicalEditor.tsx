import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import ToolbarPlugin from "../Toolbar";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { useSharedHistoryContext } from "./context/SharedHistoryContext";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LayoutPlugin } from "./LayoutPlugin/LayoutPlugin";
import type { LayoutTemplate } from "./LayoutPlugin/LayoutContainerNode";
import { use, useEffect, useMemo, type JSX } from "react";
import MarkdownPlugin from "./MarkdownPlugin/MarkdownPlugin";
import EquationsPlugin from "./EquationPlugin/EquationsPlugin";
import { useSelector } from "react-redux";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import type { RootState } from "../../store";
import { CollaborationPlugin } from "@lexical/react/LexicalCollaborationPlugin";
import { createSyncronizationProvider } from "./collaborator/providers";

export default function LexicalEditor( { placeholder, template, aspectRatio } : { placeholder: string, template: LayoutTemplate, aspectRatio: number } ) : JSX.Element {
    const {historyState} = useSharedHistoryContext();
    const [editor] = useLexicalComposerContext();
    const metadata = useSelector((state: RootState) => state.editor.metadata);
    const user = useSelector((state: RootState) => state.auth.user);

    const username = useSelector((state: RootState) => state.auth.user?.username);
    const id = useSelector((state: RootState) => state.editor.metadata?.id);

    useEffect(()=>{
        console.log("Editor: user or id changed", {user, id});
    },[user, id]);
    return (
    <>
        <CollaborationPlugin id={id!} username={username!} providerFactory={createSyncronizationProvider} shouldBootstrap={false}/>
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
            <HistoryPlugin externalHistoryState={historyState} />
            <AutoFocusPlugin />
            <MarkdownPlugin />
            <EquationsPlugin />
        </div>
    </>    
    );
}