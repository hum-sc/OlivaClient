import { $addUpdateTag, $isElementNode, COMMAND_PRIORITY_HIGH, DELETE_CHARACTER_COMMAND, ElementNode, HISTORY_MERGE_TAG, KEY_ENTER_COMMAND, TextNode, type CommandListener, type LexicalCommand, type LexicalNode, type NodeKey, type RangeSelection, type UpdateListenerPayload } from "lexical";

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
    COMMAND_PRIORITY_EDITOR, createCommand
} from "lexical";

import { useEffect } from "react";

import {
    $createFilledLayoutContainer,
    $createLayoutContainerNode,
    $displaceContentUpwardsOnce,
    $isLayoutContainerEmpty,
    $isLayoutContainerNode,
    $isUniqueLayoutContainerNode,
    LayoutContainerNode,
    type LayoutTemplate
} from './LayoutContainerNode';

import {
    $createLayoutItemNode,
    $isLayoutItemNode,
    LayoutItemNode,
} from './LayoutItemNode';
import { useCollaborationContext } from "@lexical/react/LexicalCollaborationContext";
import { $createPageBreakNode } from "./PageBreakNode";

export const INSERT_LAYOUT_COMMAND: LexicalCommand<LayoutTemplate> = 
    createCommand<LayoutTemplate>();

export const UPDATE_LAYOUT_COMMAND: LexicalCommand<{
    template:LayoutTemplate,
    nodeKey:NodeKey
}> = createCommand<{template:LayoutTemplate, nodeKey:NodeKey}>()

export const INSERT_NEW_PAGE_ON_OVERFLOW = "insert-new-page-on-overflow";
export const REMOVE_PAGE_ON_UNDO = "remove-page-on-undo";

function ensureNextLayoutContainer( layoutContainer: LayoutContainerNode, aspectRatio: number) {
    let nextLayoutContainer = layoutContainer.getNextSibling<LayoutContainerNode>();
    if (!nextLayoutContainer || !$isLayoutContainerNode(nextLayoutContainer)) {
        nextLayoutContainer = $createFilledLayoutContainer(layoutContainer.getTemplate(), aspectRatio);
        const parent = layoutContainer.getParent<ElementNode>();
        if (parent !== null) parent.append(nextLayoutContainer);
    }
    return nextLayoutContainer;
}


function moveChildrenToNext(editor: any, layoutItem: LayoutItemNode, nextLayoutItemInNextContainer: LayoutItemNode, selection: RangeSelection, overflowedSize?: number) {
    const selectionNode = selection.anchor.getNode();
    const children = layoutItem.getChildren<ElementNode>();
    let accumulatedHeight = 0;
    const overflowLimit = overflowedSize ?? Infinity;
    while (accumulatedHeight < overflowLimit && children.length > 0) {
        const child = children.pop();
        if (child) {
            const childElement = editor.getElementByKey(child.getKey());
            if (childElement) {
                // @ts-ignore
                accumulatedHeight += childElement.clientHeight;
            }

            let selectNext = false;
            if (selectionNode instanceof TextNode) {
                selectNext = $getLeafNodes(child).some((n) => n.getKey() === selectionNode.getKey());
            } else if (selectionNode) {
                const leafNodes = $getLeafNodes(selectionNode as ElementNode);
                const childLeafNodes = $getLeafNodes(child);
                selectNext = childLeafNodes.some((n) => leafNodes.includes(n));
            }
            selectNext = selectNext || selectionNode === child;

            child.remove();
            nextLayoutItemInNextContainer.getFirstChild()?.insertBefore(child);

            if (selectNext){
                // Check whether the selection is at the start or end of the child
                const isAtEnd = selection.anchor.offset === selection.anchor.getNode().getTextContentSize();
                if (isAtEnd) {
                child.selectEnd();
                } else {
                    const offset = Math.min(selection.anchor.offset, child.getTextContentSize());
                    
                    const textNode = child.getFirstChild<TextNode>();
                    if (textNode) {
                        textNode.select(offset, offset);
                    } else {
                        child.selectStart();
                    }
                }
            }
        }
    }
}

export function LayoutPlugin({aspectRatio}: {aspectRatio: number, template: LayoutTemplate}): null {
    const [editor] = useLexicalComposerContext();
    const collabContext = useCollaborationContext();
    const {yjsDocMap} = collabContext;
    useEffect(()=>{
        if(!yjsDocMap.size){
            return;
        }
    })
    useEffect(()=>{
        if(!editor.hasNodes([LayoutContainerNode, LayoutItemNode])){
            throw new Error(
                "Layout plugin: LayoutContainerNode, or LayoutItemNode not registered on editor",
            );
        }
        
        const $fillLayoutItemIfEmpty = (node: LayoutItemNode) => {
            if (node.isEmpty()) {
                node.append($createParagraphNode());
            }
        };

        const $insertLayout = () => {
            return (template: LayoutTemplate) => {
                editor.update(() => {
                    const container = $createLayoutContainerNode(template);
                    const itemsCount = getItemsCountFromTemplate(template);
                    for (let i = 0; i < itemsCount; i++) {
                        container.append(
                            $createLayoutItemNode().append($createParagraphNode())
                        );
                    }
                    $insertNodeToNearestRoot(container);
                    container.selectStart();
                });

                return true;
            };
        };

        const $onDelete = () => {
            // TODO: Check if all layout items are empty, then remove the layout container.
            const selection = $getSelection();
            if (
                $isRangeSelection(selection) &&
                selection.isCollapsed() &&
                selection.anchor.offset === 0
            ){
                const layoutContainerNode = $findMatchingParent(
                    selection.anchor.getNode(),
                    $isLayoutContainerNode,
                );
                if($isLayoutContainerNode(layoutContainerNode)){
                    if($isLayoutContainerEmpty(layoutContainerNode)){
                        if(!$isUniqueLayoutContainerNode(layoutContainerNode)){
                            layoutContainerNode.remove();
                        }
                        return true;
                    } else {
                        const layoutItemIndex = $findMatchingParent(
                            selection.anchor.getNode(),
                            $isLayoutItemNode,
                        )?.getIndexWithinParent();
                        const contentUpwards = $findMatchingParent(
                            selection.anchor.getNode(),
                            $isElementNode
                        )?.getPreviousSiblings();
                        if(contentUpwards && contentUpwards.length > 0){
                            const nextLayoutContainer = 
                                layoutContainerNode.getNextSibling<LayoutContainerNode>();
                            if($isLayoutContainerNode(nextLayoutContainer))
                                $displaceContentUpwardsOnce(
                                    layoutContainerNode,
                                    nextLayoutContainer, 
                                    layoutItemIndex
                                );
                            return false;
                        } else {
                            const prevLayoutContainer = layoutContainerNode.getPreviousSibling<LayoutContainerNode>();
                            if($isLayoutContainerNode(prevLayoutContainer)){
                                prevLayoutContainer.
                                    getChildAtIndex<LayoutItemNode>(
                                        layoutItemIndex!
                                    )?.selectEnd();
                                $displaceContentUpwardsOnce(
                                    prevLayoutContainer,
                                    layoutContainerNode,
                                    layoutItemIndex
                                );
                            }
                            return true;
                        }

                    }
                    return true;
                }
            }
            return false;
        }

        const $onEditorUpdate = (changes: UpdateListenerPayload) => {

            changes.editorState.read(() => {
                const selection = $getSelection();
                if(
                    $isRangeSelection(selection)
                ){
                    const layoutItem = $findMatchingParent(
                        selection.anchor.getNode(),
                        $isLayoutItemNode,
                    );
                    const layoutContainer = $findMatchingParent(
                        selection.anchor.getNode(),
                        $isLayoutContainerNode,
                    );

                    if( $isLayoutItemNode(layoutItem) &&
                        $isLayoutContainerNode(layoutContainer)
                    ){
                        const itemSize = editor.getElementByKey(layoutItem.getKey())?.clientHeight || 0;
                        const children = layoutItem.getChildren<ElementNode>();
                        let childrenSize = 0;
                        for(const child of children){
                            const childElement = editor.getElementByKey(child.getKey());
                            if(childElement){
                                childrenSize += childElement.clientHeight;
                            }
                        }
                        if (itemSize < childrenSize) {
                            editor.update(() => {
                                $addUpdateTag(HISTORY_MERGE_TAG);

                                const nextLayoutContainer = ensureNextLayoutContainer(layoutContainer, aspectRatio);
                                const nextLayoutItemInNextContainer = nextLayoutContainer.getChildAtIndex<LayoutItemNode>(layoutItem.getIndexWithinParent());

                                if ($isLayoutItemNode(nextLayoutItemInNextContainer)) {

                                    const overflowedSize = childrenSize - itemSize;
                                    moveChildrenToNext(editor, layoutItem, nextLayoutItemInNextContainer, selection, overflowedSize);

                                }
                            });
                        }
                        
                    }
                    
                }
                //
            });

        };
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

        const $updateLayout = ({ template , nodeKey }:{template: LayoutTemplate, nodeKey: NodeKey}) => {
            editor.update(() => {
                const container = $getNodeByKey<LexicalNode>(nodeKey);

                if (!$isLayoutContainerNode(container)) {
                    return;
                }

                const itemsCount = getItemsCountFromTemplate(template);
                const prevItemsCount = getItemsCountFromTemplate(
                    container.getTemplate()
                );

                if (itemsCount > prevItemsCount) {
                    for (let i = prevItemsCount; i < itemsCount; i++) {
                        container.append(
                            $createLayoutItemNode().append($createParagraphNode())
                        );
                    }
                } else if (itemsCount < prevItemsCount) {
                    for (let i = prevItemsCount - 1; i >= itemsCount; i--) {
                        const layoutItem = container.getChildAtIndex<LexicalNode>(i);
                        if ($isLayoutItemNode(layoutItem)) {
                            layoutItem.remove();
                        }
                    }
                }
                container.setTemplate(template);
            });
            return true;
        };
        const $onEnter:CommandListener<KeyboardEvent | null> = (payload: KeyboardEvent | null) => {
            if(payload?.shiftKey){
                const selection = $getSelection();
                if(
                    $isRangeSelection(selection)
                ){
                    console.log("Shift+Enter pressed inside layout item");
                    //selection.insertLineBreak(false);
                    const selectionNode = selection.anchor.getNode();
                    if($isLayoutItemNode(selectionNode))return true;
                    let actualNode = selectionNode.getParent();
                    let firstNode = selectionNode;
                    if (selectionNode instanceof TextNode){
                        actualNode = selectionNode.getParent();
                        firstNode.remove();
                        firstNode = $createParagraphNode().append(firstNode);
                    } else {
                        actualNode = selectionNode;
                        firstNode = selectionNode;
                    }
                    const nextSiblings = [firstNode, ...actualNode?.getNextSiblings() || [] ] ;
                    console.log(nextSiblings);
                    const layoutContainer = $findMatchingParent(
                        selection.anchor.getNode(),
                        $isLayoutContainerNode,
                    );
                    let nextLayoutContainer: LayoutContainerNode | undefined = undefined;
                    if (layoutContainer) {
                        nextLayoutContainer = ensureNextLayoutContainer(layoutContainer, aspectRatio);
                    }
                    const layoutItemIndex = $findMatchingParent(
                        selection.anchor.getNode(),
                        $isLayoutItemNode,
                    )?.getIndexWithinParent();
                     
                    if (nextLayoutContainer) {
                        const nextLayoutItemInNextContainer = nextLayoutContainer.getChildAtIndex<LayoutItemNode>(layoutItemIndex!);
                        const newFirstNode = nextLayoutItemInNextContainer!.getFirstChild();
                        for(const sibling of nextSiblings){
                            sibling!.remove();
                            newFirstNode?.insertBefore(sibling!);
                        }
                        nextLayoutItemInNextContainer?.selectStart();
                        const pageBreack = $createPageBreakNode();
                        nextLayoutItemInNextContainer?.getFirstChild()?.insertBefore(pageBreack);
                        if (pageBreack.__next) {
                            const nextNode = $getNodeByKey(pageBreack.__next)
                            
                            nextNode?.remove()
                        }
                        if (pageBreack.__prev) {
                            const prevNode = $getNodeByKey(pageBreack.__prev)
                            if (prevNode?.getTextContent() === "") prevNode?.remove()
                        }
                    }
                    // keep previous behavior: insert the new container after the current one
                    if (layoutContainer && nextLayoutContainer) layoutContainer.insertAfter(nextLayoutContainer);
                }
                return false;

            }

            return false;
        };
        return mergeRegister(
            editor.registerUpdateListener($onEditorUpdate),
            editor.registerCommand(
                KEY_ENTER_COMMAND,
                $onEnter,
                COMMAND_PRIORITY_HIGH,
            ),
            editor.registerCommand(
                INSERT_LAYOUT_COMMAND,
                $insertLayout(),
                COMMAND_PRIORITY_EDITOR,
            ),
            editor.registerCommand(
                UPDATE_LAYOUT_COMMAND,
                $updateLayout,
                COMMAND_PRIORITY_EDITOR
            ),
            editor.registerCommand(
                DELETE_CHARACTER_COMMAND,
                () => $onDelete(),
                COMMAND_PRIORITY_HIGH,
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

function $getLeafNodes( node: ElementNode ): LexicalNode[] {
    const leafNodes: LexicalNode[] = [];
    const children = node.getChildren<LexicalNode>();
    for(const child of children){
        if( child instanceof ElementNode ){
            const childLeafNodes = $getLeafNodes(child);
            leafNodes.push(...childLeafNodes);
        } else {
            leafNodes.push(child);
        }
    }   
    return leafNodes;
}