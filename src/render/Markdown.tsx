import { Marked, type MarkedOptions, type Token } from "marked";
import ReactParser from "./ReactParser";
import ReactRenderer, { type ReactRendererOptions } from "./ReactRenderer";
import type { HTMLAttributes } from "react";
export type LexerOptions = Pick<MarkedOptions, "gfm" | "breaks">;

export interface MarkdownProps extends ReactRendererOptions, LexerOptions, HTMLAttributes<HTMLDivElement> {
    value?: string;
    children?: string;
    isInline?: boolean;
    instance?: Marked;
    id?:string;
    style?:React.CSSProperties;
}

export const validateComponentProps = (props: MarkdownProps) => {
    if (props.value && typeof props.value !== "string") {
        throw new Error("Invalid prop: value must be a string");
    }

    if (props.children && typeof props.children !== "string") {
        throw new Error("Invalid prop: children must be a string");
    }
};

export const defaultProps = {
    isInline: false,
    breaks: false,
    gfm: true,
    baseUrl: undefined,
    openLinksInNewTab: true,
    langPrefix: "language-",
    renderer: undefined,
};
const math = {
  name:"math",
  level: 'block' as const,
  start(src:string) {
    const match = src.match(/\$\$/);
    return match?.index;
  },
  tokenizer(src:string, tokens: Token[]) {
    const match = src.match(/^\$\$([^$]+?)\$\$/);
    if (match) {
      return {
        type: 'math',
        raw: match[0],
        text: match[1].trim(),
        tokens: []
      };
    }  
    return false;
  },
  renderer(token: any) {
    return `<div class="math-block">${token}</div>`;
  }
}

const inlineMath = {
  name:"inlineMath",
  level: 'inline' as const,
  start(src:string) {
    const match = src.match(/\$/);
    return match?.index;
  },
  tokenizer(src:string, tokens: Token[]) {
    const match = src.match(/^\$([^$]+?)\$/);
    if (match) {
      return {
        type: 'inlineMath',
        raw: match[0],
        text: match[1].trim(),
        tokens: []
      };
    }
    return false;
  },
  renderer(token: any) {
    return `<span class="math-inline">${token}</span>`;
  }
}


export function useMarkedJS() {
  const marked = new Marked();
  marked.use({ extensions: [math, inlineMath] });
  return marked;
}

function Markdown(props: MarkdownProps) {
    validateComponentProps(props);
    const options = { ...defaultProps, ...props };
    const marked = useMarkedJS();

    /**const lexerOptions = {
        breaks: options.breaks,
        gfm: options.gfm,
        tokenizer: marked.defaults.tokenizer
    };*/

    const markdownString = options.value ?? options.children ?? "";

    const tokens = options.isInline ? marked.Lexer.lexInline(markdownString) : marked.lexer(markdownString);

    const parserOptions = {
        renderer: new ReactRenderer({
            renderer: options.renderer,
            baseUrl: options.baseUrl,
            openLinksInNewTab: options.openLinksInNewTab,
            langPrefix: options.langPrefix,
        })
    };

    const parser = new ReactParser(parserOptions);
    const children = options.isInline ? parser.parseInline(tokens) : parser.parse(tokens);

    return<div id={props.id} className="markdown">
     
        {children}
     
    </div>;

}

export default Markdown;

