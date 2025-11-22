import type {
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    EditorConfig,
    LexicalEditor,
    LexicalNode,
    NodeKey,
    SerializedElementNode,
} from "lexical";

import { addClassNamesToElement } from "@lexical/utils";
import { $createParagraphNode, $isParagraphNode, ElementNode } from "lexical";
export type SerializedLayoutItemNode = SerializedElementNode;

export interface LayoutItemTemplate {
    id: string;
    area: string;
}

function $convertLayoutItemElement():DOMConversionOutput | null {
    return { node: $createLayoutItemNode() };
}

export function $isEmptyLayoutItemNode( node: LexicalNode ): boolean {
    if( !$isLayoutItemNode(node) || node.getChildrenSize() !== 1 ){
        return false;
    } const firstChild = node.getFirstChild();
    return $isParagraphNode(firstChild) && firstChild.isEmpty();
}

export class LayoutItemNode extends ElementNode {
    __template: LayoutItemTemplate;
    constructor(template:LayoutItemTemplate, key?: NodeKey){
        super(key);
        this.__template = template;
        
    }
    static getType(): string {
        return "layout-item";
    }
    
    static clone( node: LayoutItemNode ): LayoutItemNode {
        return new LayoutItemNode( node.__template, node.__key );
    }

    createDOM(config: EditorConfig): HTMLElement {
        const dom = document.createElement("div");
        dom.setAttribute("data-lexical-layout-item", "true");
        if( typeof config.theme.layoutItem === "string") {
            addClassNamesToElement(dom, config.theme.layoutItem);
        }
        dom.id = this.__template.id;
        dom.style.gridArea=this.__template.area;
        
        return dom;
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement('div');
        element.style.gridArea = this.__template.area;
        element.id=this.__template.id;
        element.setAttribute("data-lexical-layout-node","true");
        return {element};
    }

    updateDOM(): boolean {
        return false;
    }

    collapseAtStart(): boolean {
        const parent = this.getParentOrThrow();
        if(
            this.is(parent.getFirstChild()) &&
            parent.getChildren().every($isEmptyLayoutItemNode)
        ) {
            parent.remove();
            return true;
        }
        return false;
    }

    static importDOM(): DOMConversionMap | null {
        return {
            div: ( domNode: HTMLElement ) => {
                if( !domNode.hasAttribute("data-lexical-layout-item") ) {
                    return null;
                }
                return {
                    conversion: $convertLayoutItemElement,
                    priority: 2,
                };
            },
        };
    }

    static importJSON(serializedNode: SerializedLayoutItemNode): LexicalNode {
        return $createLayoutItemNode().updateFromJSON(serializedNode);
    }

    isShadowRoot(): boolean {
        return true;
    }
}

export function $createLayoutItemNode(template:LayoutItemTemplate={id:"",area:""}): LayoutItemNode {
    const layoutItem = new LayoutItemNode(template);
    return layoutItem;
}

export function $isLayoutItemNode(
    node: LexicalNode | null | undefined,
):node is LayoutItemNode {
    return node instanceof LayoutItemNode;
}