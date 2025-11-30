import { $createParagraphNode, $createTextNode, ElementNode, ParagraphNode, type DOMConversionMap, type DOMConversionOutput, type DOMExportOutput, type EditorConfig, type LexicalNode, type LexicalUpdateJSON, type NodeKey, type SerializedElementNode, type Spread } from "lexical";
import {addClassNamesToElement} from '@lexical/utils'
import { $createLayoutItemNode, $isLayoutItemNode, LayoutItemNode, type LayoutItemTemplate } from "./LayoutItemNode";
import { $isPageBreakNode } from "./PageBreakNode";
export let defaultClassName = "page";

export interface LayoutTemplate {
    columns: string;
    rows: string;
    components: LayoutItemTemplate[];
}


export type SerializedLayoutContainerNode = Spread<
    {
        template:LayoutTemplate,
    },
    SerializedElementNode
>;

function $convertLayoutContainerElement(
    domNode: HTMLElement,
): DOMConversionOutput | null {
    const styleAttributes = window.getComputedStyle(domNode);
    const templateColumns = styleAttributes.getPropertyValue(
        'grid-template-columns',
    );
    const templateRows = styleAttributes.getPropertyValue(
        'grid-template-rows',
    )

    const templateComponents = domNode.getAttribute("template-components");
    const parsedTemplateComponents = JSON.parse(templateComponents || "[]");

    const template: LayoutTemplate = {
        columns: templateColumns,
        rows: templateRows,
        components: parsedTemplateComponents,
    }

    if ( templateColumns ) {
        const node = $createLayoutContainerNode(template);
        return {node};
    }
    return null;
}

export class LayoutContainerNode extends ElementNode {
    __template: LayoutTemplate;
    __aspectRatio: number | null;
    
    constructor( template: LayoutTemplate, aspectRatio:number | null, key?: NodeKey ) {
        super(key);
        this.__template = template;
        this.__aspectRatio = aspectRatio;
    }

    static getType(): string {
        return "layout-container";
    }

    static clone( node: LayoutContainerNode ): LayoutContainerNode {
        return new LayoutContainerNode( node.__template, node.__aspectRatio, node.__key );
    }
    createDOM(config: EditorConfig): HTMLElement {
        const dom = document.createElement('div');
        dom.style.gridTemplateColumns = this.__template.columns;
        dom.style.gridTemplateRows = this.__template.rows;
        dom.style.aspectRatio = this.__aspectRatio ? this.__aspectRatio.toString() : "auto";
        if (typeof config.theme.layoutContainer ==="string"){
            addClassNamesToElement(dom, config.theme.layoutContainer)
        }
        return dom;
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement("div");
        element.style.gridTemplateColumns = this.__template.columns ;
        element.style.gridTemplateRows = this.__template.rows;
        element.style.aspectRatio = this.__aspectRatio ? this.__aspectRatio.toString() : "auto";
        element.setAttribute("template-components", JSON.stringify(this.__template.components))
        element.setAttribute("data-lexical-layout-container", "true");
        return { element };
    }

    updateDOM(prevNode: this, dom: HTMLElement): boolean {
        if(prevNode.__template.columns !== this.__template.columns){
            dom.style.gridTemplateColumns = this.__template.columns;
        }
        if(prevNode.__template.rows !== this.__template.rows){
            dom.style.gridTemplateRows = this.__template.rows;
        }
        if(prevNode.__template.components !== this.__template.components) {
            dom.setAttribute("template-components", this.__template.components.toString())
        }
        if(prevNode.__aspectRatio !== this.__aspectRatio){
            dom.style.aspectRatio = this.__aspectRatio ? this.__aspectRatio.toString() : "auto";
        }
        return false;
    }

    static importDOM():DOMConversionMap | null {
        return {
            div: (domNode: HTMLElement) => {
                if(!domNode.hasAttribute("data-lexical-layout-container") || !domNode.hasAttribute("template-components")){
                    return null;
                }
                return {
                    conversion: $convertLayoutContainerElement,
                    priority: 2,
                };
            },
        };
    }

    static importJSON( json: SerializedLayoutContainerNode ): LexicalNode {
        return $createLayoutContainerNode().updateFromJSON(json);
    }

    updateFromJSON(
        serializedNode: LexicalUpdateJSON<SerializedLayoutContainerNode>,
    ): this {
        return super.updateFromJSON(serializedNode).setTemplate(serializedNode.template);
    }

    isShadowRoot(): boolean {
        return true;
    }

    canBeEmpty(): boolean {
        return false;
    }

    exportJSON(): SerializedLayoutContainerNode {
        return {
            ...super.exportJSON(),
            template: this.__template
        }
    }

    getTemplateColumns(): string {
        return this.getLatest().__template.columns;
    }

    setTemplateColumns( templateColumns: string ): this {
        const self = this.getWritable();
        self.__template.columns = templateColumns;
        return self;
    }

    getTemplateRows(): string {
        return this.getLatest().__template.rows;
    }

    setTemplateRows( templateRows: string ): this {
        const self = this.getWritable();
        self.__template.rows = templateRows;
        return this;
    }

    getTemplate(): LayoutTemplate {
        return this.getLatest().__template;

    }

    setTemplate( template: LayoutTemplate ):this {
        const self = this.getWritable();
        self.__template = template
        return self;
    }

    setAspectRatio( aspectRatio: number | null ): this {
        const self = this.getWritable();
        self.__aspectRatio = aspectRatio;
        return self;
    }
    getAspectRatio(): number | null {
        return this.getLatest().__aspectRatio;
    }
}

export function $createLayoutContainerNode(
    template:LayoutTemplate = {
        columns: '',
        rows: '',
        components:[]
    },
    aspectRatio:number | null = null,
): LayoutContainerNode {
    return new LayoutContainerNode( template, aspectRatio )
}

export function $createFilledLayoutContainer(
    template:LayoutTemplate = {
        columns:'',
        rows:'',
        components:[{id:"", area:""}] as LayoutItemTemplate[],
    },
    aspectRatio:number,
) {
    
    const layout = $createLayoutContainerNode(template, aspectRatio);

    for( let componentTemplate of template.components ){
        const part = $createLayoutItemNode(componentTemplate);
        part.append($createParagraphNode().append($createTextNode()));
        layout.append(part);
    }

    return layout;
}

export function $isLayoutContainerNode(
    node: LexicalNode | null | undefined,
): node is LayoutContainerNode {
    return node instanceof LayoutContainerNode;
}

export function $isLayoutContainerEmpty (
    node: LayoutContainerNode
): boolean {
    const items = node.getChildren<LayoutItemNode>();
    for (const item of items) {
        if (item.getChildrenSize() > 0) {
            if(item.getChildrenSize()==1){
                const child = item.getFirstChild<ParagraphNode>();
                if(child && child.getChildrenSize()===0){
                    continue;
                }
            }
            return false;
        }
    }
    return true;
}
export function $isUniqueLayoutContainerNode(
    node: LayoutContainerNode
): boolean {
    const parent = node.getParent();

    if( parent !== null && parent.getChildrenSize() > 1){
        return false;
    }
    return true;
}

export function $displaceContentUpwardsOnce(
    prevNode: LayoutContainerNode,
    node: LayoutContainerNode,
    itemIndex: number = 0,
):void{
    const item = node.getChildAtIndex<LayoutItemNode>(itemIndex);
    if($isLayoutItemNode(item)){
        const firstChildren = item.getFirstChild();
        if($isPageBreakNode(firstChildren)){
            console.log("Stoping displacement");
            return;
        } else {
            firstChildren?.remove();
            prevNode.getChildAtIndex<LayoutItemNode>(
                itemIndex
            )?.append(firstChildren!);
            if($isLayoutContainerEmpty(node)){
                node.remove();
            }
            const nextLayoutContainer = node.getNextSibling<LayoutContainerNode>();
            if($isLayoutContainerNode(nextLayoutContainer))
            $displaceContentUpwardsOnce(
                node,
                nextLayoutContainer,
                itemIndex
            );
        }
    }
}