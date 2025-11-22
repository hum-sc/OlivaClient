import { useState, type JSX } from "react";
import type { LexicalEditor } from "lexical";
import { on } from "events";
import { INSERT_LAYOUT_COMMAND } from "./LayoutPlugin";
import { type LayoutTemplate } from "./LayoutContainerNode";
const LAYOUTS = [
    {
        label: "Cornell",
        value:{
            columns: '1fr 3fr', 
            rows: '5fr 1fr', 
            components:[
                { id: 'Notes', area: '1 / 1 / 2 / 2' },
                { id: 'Main', area: '1 / 2 / 2 / 3' },
                { id: 'Summary', area: '2 / 1 / 3 / 3' },
            ],
        } as LayoutTemplate
    },
];

export default function InsertLayoutPlugin({
    activeEditor,
    onClose,
} : {
    activeEditor: LexicalEditor, 
    onClose: () => void
}) : JSX.Element {
    const [layout, setLayout] =  useState(LAYOUTS[0]);
    const butonLabel = LAYOUTS.find(l => l.label === layout.label)?.label;

    const onClick = () => {
        activeEditor.dispatchCommand(INSERT_LAYOUT_COMMAND, layout.value);
        onClose();
    }
    return <>
    </>
}