import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import ToolbarPlugin from "../Toolbar";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { useSharedHistoryContext } from "./context/SharedHistoryContext";
import { type LayoutTemplate } from "./LayoutPlugin/LayoutContainerNode";
import { useEffect, type JSX } from "react";
import MarkdownPlugin from "./MarkdownPlugin/MarkdownPlugin";
import EquationsPlugin from "./EquationPlugin/EquationsPlugin";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { CollaborationPlugin } from "./LayoutPlugin/ColaborationPlugin";
import { createSyncronizationProvider } from "./collaborator/providers";
import { LayoutPlugin } from "./LayoutPlugin/LayoutPlugin";
import type { InitialEditorStateType } from "@lexical/react/LexicalComposer";
import type { Metadata, MetadataList } from "../../features/dataSync/MetadataStore";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useDocument } from "@automerge/react";
import { useCollaborationContext } from "@lexical/react/LexicalCollaborationContext";
import TableHoverActionsPlugin from "./TablePlugin/TableHoverActionsPlugin";
import TableCellResizerPlugin from "./TablePlugin/TableCellResizer";
import TableActionMenuPlugin from "./TablePlugin/TableActionMenuPlugin";
import { TablePlugin } from "./TablePlugin";
import ContextMenuPlugin from "./ContextMenuPlugin";
import ShortcutsPlugin from "./ShorcutsPlugin";
import { ToolbarContext } from "./context/ToolbarContext";



export default function LexicalEditor( { placeholder, template, aspectRatio, user, id, initialEditorState, shouldBootstrap } : { placeholder: string, template: LayoutTemplate, aspectRatio: number, user: string, id: string, initialEditorState?: InitialEditorStateType, shouldBootstrap?: boolean} ) : JSX.Element {
    const {historyState} = useSharedHistoryContext();
    const username = useSelector((state: RootState) => state.auth.user?.username);
    useEffect(()=>{
        console.log("Editor: user or id changed", {user, id});
    },[user, id,]);
    const docUrl = useSelector((state: RootState) => state.dataSync.docUrl);    
    const [, changeDoc] = useDocument<MetadataList>(docUrl,{
        suspense: true
    });

    const [editor] = useLexicalComposerContext();
        useEffect(()=>{
            editor.registerTextContentListener((textContent)=>{
                changeDoc(doc => {
                    doc.metadata.find(
                        (meta) => meta.notebookID === id
                    )!.updatedAt = new Date();
                });
            });
        }, [editor]);

    return (!id ? <></>:
    <>
    <ToolbarContext>
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
            <TablePlugin
              hasCellMerge={true}
              hasCellBackgroundColor={true}
              hasHorizontalScroll={true}
              hasNestedTables={false}
            />
        </div>
        </ToolbarContext>
    </>    
    );
}