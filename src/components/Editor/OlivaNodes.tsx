import type { Klass, LexicalNode } from "lexical";
import {CodeHighlightNode, CodeNode} from '@lexical/code';
import {HashtagNode} from '@lexical/hashtag';
import {AutoLinkNode, LinkNode} from '@lexical/link';
import {ListItemNode, ListNode} from '@lexical/list';
import {MarkNode} from '@lexical/mark';
import {OverflowNode} from '@lexical/overflow';
import {HorizontalRuleNode} from '@lexical/react/LexicalHorizontalRuleNode';
import {HeadingNode, QuoteNode} from '@lexical/rich-text';
import {TableCellNode, TableNode, TableRowNode} from '@lexical/table';
import { LayoutContainerNode } from "./LayoutPlugin/LayoutContainerNode";
import { LayoutItemNode } from "./LayoutPlugin/LayoutItemNode";
import { EquationNode } from "./EquationPlugin/EquationNode";

export const OlivaNodes: Array<Klass<LexicalNode>>=[
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    TableNode,
    TableCellNode,
    HashtagNode,
    CodeHighlightNode,
    AutoLinkNode,
    LinkNode,
    OverflowNode,
    MarkNode,
    HorizontalRuleNode,
    TableRowNode,
    LayoutContainerNode,
    LayoutItemNode,
    EquationNode
]