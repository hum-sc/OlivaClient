import { ElementNode, type LexicalNode, type LexicalCommand, type NodeKey, DELETE_CHARACTER_COMMAND, COMMAND_PRIORITY_HIGH, type UpdateListenerPayload, TextNode, $addUpdateTag, HISTORY_MERGE_TAG, KEY_ENTER_COMMAND, type CommandListener, $getRoot } from "lexical";

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

export const INSERT_NEW_PAGE_ON_OVERFLOW = "insert-new-page-on-overflow";
export const REMOVE_PAGE_ON_UNDO = "remove-page-on-undo";

export function LayoutPlugin({aspectRatio, template}: {aspectRatio: number, template: LayoutTemplate}): null {
    const [editor] = useLexicalComposerContext();
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
                                // @ts-ignore
                                childrenSize += childElement.clientHeight;
                            }
                        }
                        if( itemSize < childrenSize && !changes.tags.has(INSERT_NEW_PAGE_ON_OVERFLOW)){
                            editor.update(() => {
                                $addUpdateTag(INSERT_NEW_PAGE_ON_OVERFLOW);
                                $addUpdateTag(HISTORY_MERGE_TAG);
                                const node = selection.anchor.getNode();
                                let nextLayoutContainer = layoutContainer.getNextSibling<LayoutContainerNode>();
                                
                                if( 
                                    nextLayoutContainer == null ||
                                    !$isLayoutContainerNode(nextLayoutContainer)
                                ){
                                    
                                    nextLayoutContainer = $createFilledLayoutContainer(layoutContainer.getTemplate(), aspectRatio);
                                    const parent = layoutContainer.getParent<ElementNode>();
                                    if(parent !== null){
                                        parent.append(nextLayoutContainer);
                                    }
                                }
                                const nextLayoutItemInNextContainer = nextLayoutContainer
                                    .getChildAtIndex<LayoutItemNode>(
                                        layoutItem.getIndexWithinParent()
                                    );
                                if( $isLayoutItemNode(nextLayoutItemInNextContainer) ){
                                    
                                    let accumulatedHeight = 0;
                                    const overflowedSize = childrenSize - itemSize;
                                    
                                    while( accumulatedHeight < overflowedSize && children.length > 0 ){
                                        const child = children.pop();
                                        if(child){
                                            const childElement = editor.getElementByKey(child.getKey());
                                            if(childElement){
                                                // @ts-ignore
                                                accumulatedHeight += childElement.clientHeight;
                                            }
                                            
                                            let selectNext = false;
                                            if( node instanceof TextNode){
                                                selectNext = $getLeafNodes(child).some((n=>n.getKey()===node.getKey()));
                                            } else {
                                                const leafNodes = $getLeafNodes(node);
                                                const childLeafNodes = $getLeafNodes(child);
                                                selectNext = childLeafNodes.some(n=>leafNodes.includes(n));
                                            }
                                            selectNext = selectNext || node === child;
                                            
                                            child.remove();
                                            nextLayoutItemInNextContainer.getFirstChild()?.insertBefore(child);
                                            selectNext && nextLayoutItemInNextContainer.selectStart();
                                        }
                                    }
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
            console.log("Enter pressed inside layout item");
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
                    let nextLayoutContainer = layoutContainer?.getNextSibling<LayoutContainerNode>();
                    if( !nextLayoutContainer ){
                        nextLayoutContainer = $createFilledLayoutContainer(layoutContainer!.getTemplate(), aspectRatio);
                    }
                    const layoutItemIndex = $findMatchingParent(
                        selection.anchor.getNode(),
                        $isLayoutItemNode,
                    )?.getIndexWithinParent();
                     
                    const nextLayoutItemInNextContainer = nextLayoutContainer
                        .getChildAtIndex<LayoutItemNode>(layoutItemIndex!);
                        const newFirstNode = nextLayoutItemInNextContainer!.getFirstChild();
                    for(const sibling of nextSiblings){
                        sibling!.remove();
                        newFirstNode?.insertBefore(sibling!);
                    }
                    layoutContainer?.insertAfter(nextLayoutContainer);
                    nextLayoutItemInNextContainer?.selectStart();
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

    useEffect(() => {
        editor.update(() => {
            const root = $getRoot();
            if(root?.getChildren().length! > 0){
                return;
            } else {
                const layout = $createFilledLayoutContainer(template, aspectRatio);
                root.append(layout);
                layout.selectStart();
            }
        });
    }, [])

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