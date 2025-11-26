import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import ToolbarPlugin from "./Toolbar";


function onError( error: Error){
    console.error(error);
}

const placeholder = "Escribe aquí...";




export default function Editor() {
    const initialConfig = {
        namespace: "MyEditor",
        onError,
    }
    return <LexicalComposer initialConfig={initialConfig}>
            <ToolbarPlugin/>
        <div className="editor-container">
            <div className="editor-inner">
                <RichTextPlugin
                    contentEditable={
                        <ContentEditable
                            className="editor-input"
                            aria-placeholder={placeholder}
                            placeholder={
                                <div
                                    className="editor-placeholder"
                                >{placeholder}</div>
                            }
                        />
                    }
                    ErrorBoundary={LexicalErrorBoundary}
                />
                <HistoryPlugin/>
                <AutoFocusPlugin/>
                {/*<TreeViewPlugin />*/}
            </div>
        </div>
    </LexicalComposer>
}