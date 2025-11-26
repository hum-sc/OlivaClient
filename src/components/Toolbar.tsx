import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection, CAN_REDO_COMMAND, CAN_UNDO_COMMAND, COMMAND_PRIORITY_LOW, FORMAT_ELEMENT_COMMAND, FORMAT_TEXT_COMMAND, REDO_COMMAND, SELECTION_CHANGE_COMMAND, UNDO_COMMAND } from "lexical";
import { useCallback, useEffect, useRef, useState } from "react";
import {mergeRegister} from '@lexical/utils'
import IconButton from "./IconButton";
import '../styles/Toolbar.css'

export default function ToolbarPlugin(){
    const [editor] = useLexicalComposerContext();
    const toolbarRef = useRef(null);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [isStrikethrough, setIsStrikethrough] = useState(false);

    const $updateToolbar = useCallback(()=>{
        const selection = $getSelection();
        if($isRangeSelection(selection)){
            setIsBold(selection.hasFormat('bold'));
            setIsItalic(selection.hasFormat('italic'));
            setIsUnderline(selection.hasFormat('underline'));
            setIsStrikethrough(selection.hasFormat('strikethrough'));
        }
    },[])
    useEffect(()=>{
        return mergeRegister(
            editor.registerUpdateListener(({editorState}) => {
                editorState.read(
                    () => {
                        $updateToolbar();
                    },
                    {editor},
                );
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                (_payload, _newEditor) => {
                    $updateToolbar();
                    return false;
                },
                COMMAND_PRIORITY_LOW
            ),
            editor.registerCommand(
                CAN_UNDO_COMMAND,
                (payload) =>{
                    setCanUndo(payload);
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(
                CAN_REDO_COMMAND,
                (payload) =>{
                    setCanRedo(payload);
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            )
        )
    },[editor, $updateToolbar])
    return <div className="toolbar large-top-round" ref = {toolbarRef}>
        <IconButton disabled={!canUndo} onClick={()=>{editor.dispatchCommand(UNDO_COMMAND, undefined)}} icon="undo" label="undo"/>
        <IconButton disabled={!canRedo} onClick={()=>{editor.dispatchCommand(REDO_COMMAND, undefined)}} icon="redo" label="redo"/>
        <IconButton onClick={()=>{editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}} className={isBold ? "active" : ""} icon="format_bold" label="bold"/>
        <IconButton onClick={()=>{editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}} className={isItalic ? "active" : ""} icon="format_italic" label="italic"/>
        <IconButton onClick={()=>{editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}} className={isUnderline ? "active" : ""} icon="format_underlined" label="underline"/>
        <IconButton onClick={()=>{editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}} className={isStrikethrough ? "active" : ""} icon="strikethrough_s" label="strikethrough"/>
        <IconButton onClick={()=>{editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')}} icon="format_align_left" label="align left"/>
        <IconButton onClick={()=>{editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')}} icon="format_align_center" label="align center"/>
        <IconButton onClick={()=>{editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')}} icon="format_align_right" label="align right"/>
        <IconButton onClick={()=>{editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')}} icon="format_align_justify" label="align justify"/>
    </div>
}