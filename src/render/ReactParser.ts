import { type ReactNode } from "react";
import type { Token, Tokens } from "marked";

import ReactRenderer, { type HeadingLevels } from "./ReactRenderer";

interface ReactParserOptions {
    renderer: ReactRenderer;
}

class ReactParser {
    renderer: ReactRenderer;

    constructor(options: ReactParserOptions) {
        this.renderer = options.renderer;
    }

    parse(tokens: Token[]): ReactNode[] {
        this.renderer.elIdList.push(0);
        const result = tokens.map((token) => {
            switch (token.type) {
                case "space":{
                    return null;
                }
                case "heading": {
                    const level = (token as Tokens.Heading).depth as HeadingLevels;
                    return this.renderer.heading(
                        this.parseInline((token as Tokens.Heading).tokens), level
                    );
                }
                case "paragraph": {
                    return this.renderer.paragraph(
                        this.parseInline((token as Tokens.Paragraph).tokens)
                    );
                }
                case "text": {
                    const textToken = token as Tokens.Text;
                    return textToken.tokens ? this.parseInline(textToken.tokens) : token.text;
                }
                case "blockquote": {
                    const blockquoteToken = token as Tokens.Blockquote;
                    const quote = this.parse(blockquoteToken.tokens);
                    return this.renderer.blockquote(quote);
                }
                case "list": {
                    const listToken = token as Tokens.List;
                    this.renderer.elIdList.push(0);
                    const children = listToken.items.map((item) => {
                        const listItemChildren = [];
                        const key = this.renderer.elementId;
                        
                        if (item.task) {
                            listItemChildren.push(this.renderer.checkbox(item.checked ?? false, key));
                        }
                        listItemChildren.push(...this.parse(item.tokens));
                        return this.renderer.listItem(listItemChildren, key);
                    });
                    this.renderer.elIdList.pop();
                    return this.renderer.list(children, token.ordered, token.ordered ? token.start : undefined);
                }
                case "code": {
                    return this.renderer.code(
                        (token as Tokens.Code).text,
                        (token as Tokens.Code).lang || undefined
                    );
                }
                case "codespan":{
                    return this.renderer.codespan(
                        (token as Tokens.Codespan).text
                    );
                }
                case "html": {
                    return this.renderer.html(
                        (token as Tokens.HTML).text
                    );
                }
                case "table": {
                    const tableToken = token as Tokens.Table;
                    
                    this.renderer.elIdList.push(0);
                    const headerCells = tableToken.header.map((cell, index) =>{
                        return this.renderer.tableCell(this.parseInline(cell.tokens), { 
                            header: true, 
                            align: tableToken.align[index] 
                        });
                    });
                    this.renderer.elIdList.pop();

                    const headerRow = this.renderer.tableRow(headerCells);
                    const header = this.renderer.tableHeader(headerRow);

                    this.renderer.elIdList.push(0);
                    const bodyChildren = tableToken.rows.map((row) => {
                        this.renderer.elIdList.push(0);
                        const rowChildren = row.map((cell, index) => {
                            return this.renderer.tableCell(this.parseInline(cell.tokens),{
                                header: false,
                                align: tableToken.align[index]
                            });
                        });
                        this.renderer.elIdList.pop();
                        return this.renderer.tableRow(rowChildren);
                    });
                    this.renderer.elIdList.pop();

                    const body = this.renderer.tableBody(bodyChildren);
                    return this.renderer.table([header, body]);
                }
                case "hr":{
                    return this.renderer.hr();
                }
                case "math": {
                    return this.renderer.math(
                        (token as any).text
                    );
                }
                case "inlineMath": {
                    return this.renderer.inlineMath(
                        (token as any).text
                    );
                }
                default: {
                    console.warn(`Unhandled block token type: ${token.type}`);
                    return null;
                }
            }
        });
        this.renderer.elIdList.pop();
        return result;
    }

    parseInline(tokens: Token[] = []): ReactNode[] {
        this.renderer.elIdList.push(0);
        const result = tokens.map((token) => {
            switch (token.type) {
                case "text": {
                    return (token as Tokens.Text).text;
                }
                case "strong": {
                    return this.renderer.strong(
                        this.parseInline((token as Tokens.Strong).tokens)
                    );
                }
                case "em": {
                    return this.renderer.em(
                        this.parseInline((token as Tokens.Em).tokens)
                    );
                }
                
                case "link": {
                    return this.renderer.link(
                        (token as Tokens.Link).href,
                        this.parseInline((token as Tokens.Link).tokens)
                    );
                }
                case "image": {
                    return this.renderer.image(
                        (token as Tokens.Image).href,
                        (token as Tokens.Image).text,
                        (token as Tokens.Image).title
                    );
                }
                case "html": {
                    return this.renderer.html(
                        (token as Tokens.HTML).text
                    );
                }
                case "br": {
                    return this.renderer.br();
                }
                case "escape": {
                    return (token as Tokens.Escape).text;
                }
                case "codespan":{
                    return this.renderer.codespan(
                        (token as Tokens.Codespan).text
                    );
                }
                case "inlineMath": {
                    return this.renderer.inlineMath(
                        (token as any).text,
                    );
                }
                case "del":{
                    return this.renderer.del(
                        this.parseInline((token as Tokens.Del).tokens)
                    );
                }
                default: {
                    console.warn(`Unhandled inline token type: ${token.type}`, token);
                    return null;
                }
            }
        });
        this.renderer.elIdList.pop();
        return result;
    }
}
export default ReactParser;

