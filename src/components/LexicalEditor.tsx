import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { $isTextNode, isHTMLElement,type Klass, type LexicalNode, ParagraphNode, TextNode, type DOMConversionMap, type DOMExportOutput, type DOMExportOutputMap, type LexicalEditor } from "lexical";
import { parseAllowedColor, parseAllowedFontSize } from "./Editor/styleConfig";
import ExampleTheme from "../styles/ExampleTheme";
import ToolbarPlugin from "./Toolbar";


function onError( error: Error){
    console.error(error);
}

const placeholder = "Escribe aquí...";

const removeStylesExportDOM = (
    editor: LexicalEditor,
    target: LexicalNode,
):DOMExportOutput=>{
    const output = target.exportDOM(editor);
    if(output && isHTMLElement(output.element)){
        for(const el of [
            output.element, 
            ...output.element.querySelectorAll('[style],[class]')
        ]){
            el.removeAttribute('class');
            el.removeAttribute('style');
        }
    }
    return output;
}

const exportMap: DOMExportOutputMap = new Map<
    Klass<LexicalNode>,
    (editor:LexicalEditor, target:LexicalNode) => DOMExportOutput
>([
    [ParagraphNode, removeStylesExportDOM],
    [TextNode, removeStylesExportDOM]
]);

const getExtraStyles = (element: HTMLElement): string => {
    let extraStyles = '';
    const fontSize = parseAllowedFontSize(element.style.fontSize);
    const backgroundColor = parseAllowedColor(element.style.backgroundColor);
    const color = parseAllowedColor(element.style.color);
    if(fontSize != '' && fontSize != '15px'){
        extraStyles+=`font-size: ${fontSize}`
    }
    if (backgroundColor !== '' && backgroundColor !== 'rgb(255, 255, 255)') {
        extraStyles += `background-color: ${backgroundColor};`;
    }
    if (color !== '' && color !== 'rgb(0, 0, 0)') {
        extraStyles += `color: ${color};`;
    }
    return extraStyles;
}

const constructImportMap = ():DOMConversionMap => {
    const importMap: DOMConversionMap = {};
    for( const [tag,fn] of Object.entries(TextNode.importDOM() || {})){
        importMap[tag] = (importNode) =>{
            const importer = fn(importNode);
            if(!importer){
                return null;
            }
            return {
                ...importer,
                conversion: (element) => {
                    const output = importer.conversion(element);
                    if(
                        output ===null ||
                        output.forChild === undefined ||
                        output.after !== undefined ||
                        output.node !== null 
                    ){
                        return output;
                    }
                    const extraStyles = getExtraStyles(element);
                    if(extraStyles){
                        const {forChild} = output;
                        return {
                            ...output,
                            forChild: (child, parent) => {
                                const textNode = forChild(child, parent);
                                if($isTextNode(textNode)){
                                    textNode.setStyle(textNode.getStyle()+extraStyles);
                                }
                                return textNode;
                            },
                        };
                    }
                    return output;
                },
            };
        };
    }
    return importMap;
};

const editorConfig = {
    html:{
        export: exportMap,
        import: constructImportMap,
    },
    namespace: "Oliva Notebook",
    nodes: [ParagraphNode, TextNode],
    onError(error:Error){
        throw error;
    },
    theme: ExampleTheme,
}

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