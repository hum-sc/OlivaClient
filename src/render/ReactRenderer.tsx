import { createElement, type ElementType, type ReactElement, type ReactNode } from "react";
import { joinBase } from "./helpers";
import { EditableComponent, type EditableComponentProps } from "../components/EditableComponent";
import type { MathComponentProps, MathComponentPropsWithMath } from "react-katex";
const pkg = await import("react-katex");
const { BlockMath, InlineMath } = pkg;
export type HeadingLevels = 1 | 2 | 3 | 4 | 5 | 6;

export interface TableFlags {
    header?: boolean;
    align?: "left" | "center" | "right" | null;
}

export type CustomReactRenderer = Partial<ReactRenderer>;
export type RendererMethods = keyof ReactRenderer;

export interface ReactRendererOptions {
    baseUrl?: string;
    openLinksInNewTab?: boolean;
    langPrefix?: string;
    renderer?: CustomReactRenderer;
    editable?: boolean;
}

class ReactRenderer {
    elIdList: number[] = [];
    #options: ReactRendererOptions;
    
    constructor(options: ReactRendererOptions = {}) {
        const { renderer } = options;
        this.#options = options;

        if (renderer && typeof renderer === "object") {
            Object.entries(renderer as ReactRenderer).forEach(([key, value]) => {
                const rendererName = key as keyof ReactRenderer;
                const rendererFuntion = value;
                
                if (
                    !this[rendererName] ||
                    rendererName === 'elementId' ||
                    rendererName === 'elIdList' ||
                    typeof rendererFuntion !== 'function'
                ){
                    return;
                }
                Object.defineProperty(this, rendererName, {
                    value(this: ReactRenderer, ...args: Parameters <(typeof this) [typeof rendererName]> ) {
                        this.#incrementElId();
                        return rendererFuntion.apply(this, args);
                    },
                    writable: true,
                    enumerable: true,
                    configurable: true,
                });
            });
        }
    }

    #h<T extends ElementType>(el: T, children: ReactNode = null, props = {}): ReactElement {
        const elProps = {
            key: `marked-react-${this.elementId}`,
            supresshydrationwarning: "true",
        };
        this.#incrementElId();
        if(this.#options.editable) return EditableComponent<T>({el, ...props, key: elProps.key, suppress: elProps.supresshydrationwarning, children} as EditableComponentProps<T>)
        return createElement(el, { ...props, ...elProps }, children);
    }

    #incrementElId() {
        this.elIdList[this.elIdList.length - 1]++;
    }

    get elementId(){
        return this.elIdList.join("-");
    }

    heading( children: ReactNode, level: HeadingLevels ): ReactElement {
        let numberLevel = level as number;
        numberLevel ++;
        level = numberLevel as HeadingLevels;
        return this.#h( `h${level}`, children );

    }

    paragraph( children: ReactNode ): ReactElement {
        return this.#h( "p", children );
    }

    link ( href: string, text: ReactNode ): ReactElement {
        const url = joinBase( href, this.#options.baseUrl );
        const target = this.#options.openLinksInNewTab ? "_blank" : undefined;
        return this.#h( "a", text, { href: url, target } );
    }

    image( src: string, alt: string, title: string | null ): ReactElement {
        const url = joinBase( src, this.#options.baseUrl );
        return this.#h( "img", null, { src: url, alt, title } );
    }

    codespan( code: ReactNode, lang?: string ): ReactElement {
        const className = lang ? `${this.#options.langPrefix}${lang}` : undefined;
        return this.#h( "code", code, { className } );
    }

    code(code:ReactNode, lang?: string ): ReactElement {
        return this.#h("pre", this.codespan(code, lang));
    }

    blockquote( children: ReactNode ): ReactElement {
        return this.#h( "blockquote", children );
    }

    list( children: ReactNode, ordered: boolean , start?:number ) : ReactElement {
        return this.#h( ordered ? "ol" : "ul", children, ordered && start != 1 ? { start } : {} );
    }

    listItem( children: ReactNode, key?: string): ReactElement {
        return this.#h( "li", children, { 
            key,
            id: key
        });
    }

    checkbox( checked: boolean , key?:string): ReactElement {
        return this.#h( "input", null, { 
            type: "checkbox", 
            checked, readOnly: true, 
            key: key,
            id:key
        } );
    }

    math( text: ReactNode ): ReactElement {
        return this.#h( BlockMath, text );
    }

    table( children: ReactNode[] ): ReactElement {
        return this.#h( "table", children );
    }

    tableHeader( children: ReactNode ): ReactElement {
        return this.#h( "thead", children );
    }

    tableBody( children: ReactNode[] ): ReactElement {
        return this.#h( "tbody", children );
    }

    tableRow( children: ReactNode[] ): ReactElement {
        return this.#h( "tr", children );
    }

    tableCell( children: ReactNode[], flags: TableFlags ): ReactElement {
        const Tag = flags.header ? "th" : "td";
        return this.#h( Tag, children, { align: flags.align});
    }

    strong( children: ReactNode ): ReactElement {
        return this.#h( "strong", children );
    }

    em( children: ReactNode ): ReactElement {
        return this.#h( "em", children );
    }

    del( children: ReactNode ): ReactElement {
        return this.#h( "del", children );
    }

    text( text: ReactNode ) {
        return text;
    }

    html( html: ReactNode ): ReactElement {
        return this.#h( "div", null, { dangerouslySetInnerHTML: { __html: html } } );
    }

    hr(): ReactElement {
        return this.#h( "hr" );
    }

    br(): ReactElement {
        return this.#h( "br" );
    }
    inlineMath( text: ReactNode ): ReactElement {
        return this.#h(InlineMath, text)
    }

}

export default ReactRenderer;