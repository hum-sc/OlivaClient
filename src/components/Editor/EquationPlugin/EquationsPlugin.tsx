import {useCallback, useEffect, type JSX} from 'react';

import 'katex/dist/katex.css';
import {
    $createParagraphNode,
    $insertNodes,
    $isRootNode,
    $isRootOrShadowRoot,
    COMMAND_PRIORITY_EDITOR,
    createCommand,
    type LexicalCommand,
    type LexicalEditor,
} from 'lexical';

import { $wrapNodeInElement } from '@lexical/utils';

import KatexEquationAlterer from './KatexEquationAlterer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createEquationNode, EquationNode } from './EquationNode';

type CommandPayload ={
    equation: string;
    inline: boolean;
}

export const INSERT_EQUATION_COMMAND: LexicalCommand<CommandPayload> =
    createCommand<CommandPayload>('INSERT_EQUATION_COMMAND');

export function InsertEquationDialog({
    editor,
    onClose,
}:{
    editor: LexicalEditor;
    onClose: ()=>void;
}): JSX.Element {
    const onEquationConfirm = useCallback(
        (equation: string, inline: boolean) => {
            editor.dispatchCommand(INSERT_EQUATION_COMMAND, {equation, inline});
            onClose();
        },
        [editor, onClose],
    );

    return (
        <KatexEquationAlterer
            onConfirm={onEquationConfirm}
        />
    );
}


export default function EquationPlugin(): JSX.Element | null {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        if (!editor.hasNodes([EquationNode])) {
            throw new Error(
                'EquationPlugin: EquationNode not registered on editor',
            );
        }

        return editor.registerCommand<CommandPayload>(
            INSERT_EQUATION_COMMAND,
            (payload) => {
                const {equation, inline} = payload;
                const equationNode = $createEquationNode(equation, inline);
                $insertNodes([equationNode]);
                if( $isRootOrShadowRoot(equationNode.getParentOrThrow())){
                    $wrapNodeInElement(equationNode, $createParagraphNode).selectEnd();
                }
                return true;
            },
            COMMAND_PRIORITY_EDITOR,
        );
    }, [editor]);
    return null;
}