import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from '@lexical/utils';
import { $getSelection, $isRangeSelection, CAN_REDO_COMMAND, CAN_UNDO_COMMAND, COMMAND_PRIORITY_LOW, FORMAT_ELEMENT_COMMAND, FORMAT_TEXT_COMMAND, REDO_COMMAND, SELECTION_CHANGE_COMMAND, UNDO_COMMAND } from "lexical";
import { useCallback, useEffect, useRef, useState } from "react";
import '../styles/components/Toolbar.css';
import IconButton from "./IconButton";
import { useToolbarState } from "./Editor/context/ToolbarContext";

export default function ToolbarPlugin(){
    const [editor] = useLexicalComposerContext();
    const toolbarContext = useToolbarState();
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
    const onDownloadPDF = useCallback(()=>{
        const pages = document.body.getElementsByClassName('notebook');
        document.body.innerHTML = pages[0].parentElement!.innerHTML;
        window.print();
        //document.body.innerHTML = actualContents;
        // Reload the original contents after printing
        window.location.reload();
    },[]);
    const onOpenFile = ()=>{
        toolbarContext.updateToolbarState('isFilePanelOpen', !toolbarContext.toolbarState.isFilePanelOpen);
        console.log("Toggled file panel to ", toolbarContext.toolbarState.isFilePanelOpen);
    };
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
        <IconButton onClick={()=>{onDownloadPDF()}} icon="download" label="Descargar PDF"/>
        <IconButton onClick={()=>{onOpenFile()}} icon={toolbarContext.toolbarState.isFilePanelOpen? "right_panel_close" : "right_panel_open"} label="Abrir pdf"/>
    </div>
}