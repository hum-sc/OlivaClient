import type { ReactRendererOptions } from "./ReactRenderer";
import { useEffect, useState, type HTMLAttributes } from "react";
import { useMarkedJS, validateComponentProps, type LexerOptions } from "./Markdown";
import { Marked } from "marked";
import ReactRenderer from "./ReactRenderer";
import ReactParser from "./ReactParser";

export interface EditableMarkdownProps extends ReactRendererOptions, LexerOptions, HTMLAttributes<HTMLDivElement> {
    value?: string;
    children?: string;
    isInline?: boolean;
    instance?: Marked;
    id?:string;
    style?:React.CSSProperties;
}

const defaultProps:ReactRendererOptions = {
    baseUrl: undefined,
    openLinksInNewTab: true,
    langPrefix: "language-",
    renderer: undefined,
};
/*const defaultLexerProps:LexerOptions = {
    gfm: true,
    breaks: false,
}*/

export default function EditableMarkdown(props:{rendererOptions?: ReactRendererOptions, lexerOptions?: LexerOptions} & EditableMarkdownProps){
    validateComponentProps(props);
    const renderOptions = {...defaultProps, ...props.rendererOptions};
    //const lexerOptions = {...defaultLexerProps, ...props.lexerOptions};
    const marked = useMarkedJS();

    const markdownString = props.value ?? props.children ?? "";

    const tokens = props.isInline ? marked.Lexer.lexInline(markdownString) : marked.lexer(markdownString);

    const parserOptions = {
        renderer: new ReactRenderer({
            ...renderOptions,
            editable: true,
        }),
    };
    

    const parser = new ReactParser(parserOptions);
    const children = props.isInline ? parser.parseInline(tokens) : parser.parse(tokens);

    return<div id={props.id} 
        {...props}
        className={props.className+" markdown"}
        style={{...props.style, minHeight:"1em"}} 
        contentEditable={true} 
        suppressContentEditableWarning={true} 
    >
        {children}
    </div>;


}


