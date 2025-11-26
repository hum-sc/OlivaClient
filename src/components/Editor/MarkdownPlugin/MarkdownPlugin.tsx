import type {JSX} from 'react';

import {MarkdownShortcutPlugin} from '@lexical/react/LexicalMarkdownShortcutPlugin';

import {OLIVA_TRANSFORMERS} from './MarkdownTransformers';

export default function MarkdownPlugin(): JSX.Element {
  return <MarkdownShortcutPlugin transformers={OLIVA_TRANSFORMERS} />;
}