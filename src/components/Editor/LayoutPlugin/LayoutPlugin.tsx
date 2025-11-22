import { ElementNode, type LexicalNode, type LexicalCommand, type NodeKey, KEY_BACKSPACE_COMMAND, DELETE_CHARACTER_COMMAND, COMMAND_PRIORITY_HIGH, KEY_ENTER_COMMAND, $isRootNode, type UpdateListenerPayload, type MutationListener, TextNode } from "lexical";

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
export const INSERT_NEW_PAGE_ON_OVERFLOW = "insert-new-page-on-overflow";
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
                                const node = selection.anchor.getNode();
                                let nextLayoutContainer = layoutContainer.getNextSibling<LayoutContainerNode>();
                                console.log("Layout item overflowed");
                                if( 
                                    nextLayoutContainer == null ||
                                    !$isLayoutContainerNode(nextLayoutContainer)
                                ){
                                    console.log("Need to create a new page");
                                    nextLayoutContainer = $createFilledLayoutContainer(layoutContainer.getTemplate());
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
                                    console.log("Moving overflowed content to next page");
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
                                            console.log(child);
                                            let selectNext = false;
                                            if( node instanceof TextNode){
                                                selectNext = $getLeafNodes(child).some((n=>n.getKey()===node.getKey()));
                                            } else {
                                                const leafNodes = $getLeafNodes(node);
                                                const childLeafNodes = $getLeafNodes(child);
                                                selectNext = childLeafNodes.some(n=>leafNodes.includes(n));
                                            }
                                            selectNext = selectNext || node === child;
                                            console.log("Selecting next: ", selectNext, " for node: ", node);
                                            child.remove();
                                            nextLayoutItemInNextContainer.getFirstChild()?.insertBefore(child);
                                            selectNext && nextLayoutItemInNextContainer.selectStart();
                                        }
                                    }
                                }

                            },{ tag: INSERT_NEW_PAGE_ON_OVERFLOW } );
                        }
                        
                    }
                    
                }
                //console.log("Current selection: ", selection);
            });

        };
        const $onLayoutItemChange:MutationListener = ( nodes, payload )=>{
            payload.prevEditorState.read(()=>{
                const selection = $getSelection();
                if( selection !== null &&
                    $isRangeSelection(selection)
                ){
                    const layoutItem = $findMatchingParent(
                        selection.anchor.getNode(),
                        $isLayoutItemNode,
                    );
                    const page = $findMatchingParent(
                        selection.anchor.getNode(),
                        $isLayoutContainerNode,
                    );

                    if( $isLayoutItemNode(layoutItem) &&
                        $isLayoutContainerNode(page)
                    ){
                        const itemSize = editor.getElementByKey(layoutItem.getKey())?.clientHeight;
                        const pageSize = editor.getElementByKey(page.getKey())?.clientHeight;
                        //console.log("Layout item changed: ", layoutItem.getKey());
                        //console.log("Page container: ", page.getKey());
                    }
                    
                }
                //console.log("Previous selection: ", selection);

            });
        }
        const $onEnter = (event: KeyboardEvent) =>{
            const selection = $getSelection();
            if (
                $isRangeSelection(selection) &&
                selection.isCollapsed()
            ){
            
                const item = $findMatchingParent(
                    selection.anchor.getNode(),
                    $isLayoutItemNode,
                );

                // If inside a layout item there no space to go down, create a new page
                if($isLayoutItemNode(item)){
                    //console.log("Enter in layout item")
                    const parent = item.getParent<ElementNode>();
                    if(
                        $isLayoutContainerNode(parent) &&
                        $isLayoutItemNode(item)
                    ){
                        const DOMItem =editor.getElementByKey(item.getKey());
                        const heightItem = DOMItem?.clientHeight;

                        const nextSibling = parent.getNextSibling();
                        
                    }
                }

                const container = $findMatchingParent(
                    selection.anchor.getNode(),
                    $isLayoutContainerNode,
                );
                if($isLayoutContainerNode(container)){
                    const parent = container.getParent<ElementNode>();
                    if(
                        parent !== null
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
            editor.registerMutationListener( TextNode , $onLayoutItemChange, {skipInitialization:false}),
            editor.registerMutationListener( LayoutItemNode, $onLayoutItemChange, {skipInitialization:false}),
            editor.registerUpdateListener($onEditorUpdate),
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