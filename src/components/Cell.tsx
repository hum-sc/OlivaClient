import { useState } from "react";
import type { Cell } from "../OlivaFormat/oli";
import Markdown from "../render";
import EditableMarkdown from "../render/EditableMarkDown";
import { EditableComponent } from "./EditableComponent";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import '../styles/Cell.css'

interface CellProps extends React.ComponentProps<'div'> {
    cell: Cell;
}

type EditEvent = {
    changeCount: number;
    content: string;
    start: number;
    end?:number;
}


export default function CellComponent(props: CellProps){
    const placeholder = 'Escribe...'
    return( 
    <ContentEditable
        className="cell"
        aria-placeholder={placeholder}
        placeholder={
            <div
                className="editor-placeholder"
            >{placeholder}</div>
        }
    />);

}