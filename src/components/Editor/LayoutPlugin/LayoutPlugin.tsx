import { ElementNode, type LexicalNode, type LexicalCommand, type NodeKey, KEY_BACKSPACE_COMMAND, DELETE_CHARACTER_COMMAND, COMMAND_PRIORITY_HIGH, KEY_ENTER_COMMAND } from "lexical";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import {
    $findMatchingParent,
    $insertNodeToNearestRoot,
    mergeRegister, 
} from "@lexical/utils";

import {
    $createParagraphNode,
    $getNodeByKey,
    $getSelection,
    $isRangeSelection,
    COMMAND_PRIORITY_EDITOR,
    COMMAND_PRIORITY_LOW,
    createCommand,
    KEY_ARROW_DOWN_COMMAND,
    KEY_ARROW_UP_COMMAND,
    KEY_ARROW_RIGHT_COMMAND,
    KEY_ARROW_LEFT_COMMAND,
    KEY_DELETE_COMMAND,
} from "lexical";

import { useEffect } from "react";

import {
    $createFilledLayoutContainer,
    $createLayoutContainerNode,
    $isLayoutContainerNode,
    LayoutContainerNode,
    type LayoutTemplate
} from './LayoutContainerNode';

import {
    $createLayoutItemNode,
    $isLayoutItemNode,
    LayoutItemNode,
} from './LayoutItemNode';

export const INSERT_LAYOUT_COMMAND: LexicalCommand<LayoutTemplate> = 
    createCommand<LayoutTemplate>();

export const UPDATE_LAYOUT_COMMAND: LexicalCommand<{
    template:LayoutTemplate,
    nodeKey:NodeKey
}> = createCommand<{template:LayoutTemplate, nodeKey:NodeKey}>()

export function LayoutPlugin(): null {
    const [editor] = useLexicalComposerContext();
    useEffect(()=>{
        if(!editor.hasNodes([LayoutContainerNode, LayoutItemNode])){
            throw new Error(
                "Layout plugin: LayoutContainerNode, or LayoutItemNode not registered on editor",
            );
        }
        const $onDelete = () => {
            const selection = $getSelection();
            if (
                $isRangeSelection(selection) &&
                selection.isCollapsed() &&
                selection.anchor.offset === 0
            ){
                const container = $findMatchingParent(
                    selection.anchor.getNode(),
                    $isLayoutContainerNode,
                );
                if($isLayoutContainerNode(container)){
                    const parent = container.getParent<ElementNode>();
                    const child = parent && parent.getFirstChild();
                    const descendant = container.getFirstDescendant()?.getKey();
                    if(
                        parent !== null &&
                        child === container &&
                        selection.anchor.key === descendant
                    ){
                        return true;
                    }
                }
            }
            return false;
        }
        const $fillLayoutItemIfEmpty = (node: LayoutItemNode) => {
            if (node.isEmpty()) {
                node.append($createParagraphNode());
            }
        };

        const $onEnter = (event: KeyboardEvent) =>{
            const selection = $getSelection();
            if (
                $isRangeSelection(selection) &&
                selection.isCollapsed() &&
                selection.anchor.offset === 0
            ){
                const container = $findMatchingParent(
                    selection.anchor.getNode(),
                    $isLayoutContainerNode,
                );
                if($isLayoutContainerNode(container)){
                    const parent = container.getParent<ElementNode>();
                    const child = parent && parent.getLastChild();
                    const descendant = container.getLastDescendant()?.getKey();
                    if(
                        parent !== null &&
                        child === container &&
                        selection.anchor.key === descendant
                    ){
                        if (event.ctrlKey) {
                            const newPage = $createFilledLayoutContainer(container.getTemplate());
                            parent.append(newPage);
                            
                            newPage.selectStart();
                            return true;
                        }
                    }
                }
            }
            return false;
        }


        const $removeIsolatedLayoutItem = (node: LayoutItemNode) => {
            const parent = node.getParent<ElementNode>();
            if(!$isLayoutContainerNode(parent)) {
                const children = node.getChildren<LexicalNode>();
                for(const child of children){
                    node.insertBefore(child);
                }
                node.remove();
                return true;
            }
            return false;
        }

        return mergeRegister(
            editor.registerCommand(
                INSERT_LAYOUT_COMMAND,
                (template: LayoutTemplate)=>{
                    editor.update(()=>{
                        const container = $createLayoutContainerNode(template);
                        const itemsCount = getItemsCountFromTemplate(template);
                        for(let i = 0;  i < itemsCount; i++){
                            container.append(
                                $createLayoutItemNode().append($createParagraphNode()),
                            );
                        }

                        $insertNodeToNearestRoot(container);
                        container.selectStart();
                    });

                    return true;
                },
                COMMAND_PRIORITY_EDITOR,
            ),
            editor.registerCommand(
                UPDATE_LAYOUT_COMMAND,
                ({template, nodeKey})=>{
                    editor.update(()=>{
                        const container = $getNodeByKey<LexicalNode>(nodeKey);

                        if( !$isLayoutContainerNode(container) ){
                            return;
                        }

                        const itemsCount = getItemsCountFromTemplate(template);
                        const prevItemsCount = getItemsCountFromTemplate(
                            container.getTemplate(),
                        );

                        if(itemsCount > prevItemsCount) {
                            for( let i = prevItemsCount; i < itemsCount; i++){
                                container.append(
                                    $createLayoutItemNode().append($createParagraphNode()),
                                )
                            }
                        } else if (itemsCount < prevItemsCount){
                            for(let i = prevItemsCount -1; i>= itemsCount; i--){
                                const layoutItem = container.getChildAtIndex<LexicalNode>(i);
                                if ($isLayoutItemNode(layoutItem)){
                                    layoutItem.remove();
                                }
                            }
                        }
                        container.setTemplate(template);
                    });
                    return true;
                },
                COMMAND_PRIORITY_EDITOR
            ),
            editor.registerCommand(
                DELETE_CHARACTER_COMMAND,
                (event) => $onDelete(),
                COMMAND_PRIORITY_HIGH,
            ),
            editor.registerCommand(
                KEY_ENTER_COMMAND,
                (event) => $onEnter(event!),
                COMMAND_PRIORITY_HIGH
            ),
            editor.registerNodeTransform(LayoutItemNode, (node) => {
                const isRemoved = $removeIsolatedLayoutItem(node);
                if(!isRemoved){
                    $fillLayoutItemIfEmpty(node);
                }
            }),
            editor.registerNodeTransform(LayoutContainerNode, (node)=>{
                const children = node.getChildren<LexicalNode>();

                if(!children.every($isLayoutItemNode)){
                    for (const child of children){
                        node.insertBefore(child);
                    }
                    node.remove();
                }
            }),
        );

    }, [editor]);

    return null;
}

function getItemsCountFromTemplate( template:LayoutTemplate ): number {
    return template.components.length;
}