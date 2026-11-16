import React from 'react';

interface MarkdownViewProps {
  content: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content }) => {
  // Parse lines for markdown formatting
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let inList = false;
  let listItems: string[] = [];
  let isNumberedList = false;

  const flushList = () => {
    if (listItems.length > 0) {
      if (isNumberedList) {
        elements.push(
          <ol key={`ol-${elements.length}`} className="list-decimal pl-5 my-2 space-y-1">
            {listItems.map((item, idx) => (
              <li key={idx} className="text-slate-800 dark:text-slate-200">
                {formatInline(item)}
              </li>
            ))}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`ul-${elements.length}`} className="list-disc pl-5 my-2 space-y-1">
            {listItems.map((item, idx) => (
              <li key={idx} className="text-slate-800 dark:text-slate-200">
                {formatInline(item)}
              </li>
            ))}
          </ul>
        );
      }
      listItems = [];
      inList = false;
      isNumberedList = false;
    }
  };

  const formatInline = (text: string): React.ReactNode[] => {
    // Process **bold**, *italic*, `code`, and links
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
    let lastIdx = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIdx) {
        parts.push(text.substring(lastIdx, match.index));
      }
      const token = match[0];
      if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(
          <strong key={match.index} className="font-semibold text-slate-900 dark:text-white">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith('*') && token.endsWith('*')) {
        parts.push(
          <em key={match.index} className="italic text-slate-800 dark:text-slate-200">
            {token.slice(1, -1)}
          </em>
        );
      } else if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(
          <code
            key={match.index}
            className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-forest-root text-emerald-600 dark:text-emerald-400 font-mono text-xs"
          >
            {token.slice(1, -1)}
          </code>
        );
      }
      lastIdx = regex.lastIndex;
    }

    if (lastIdx < text.length) {
      parts.push(text.substring(lastIdx));
    }

    return parts;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    // Headers
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={i} className="text-sm font-bold text-slate-900 dark:text-white mt-3 mb-1">
          {formatInline(trimmed.slice(4))}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={i} className="text-base font-bold text-slate-900 dark:text-white mt-4 mb-2">
          {formatInline(trimmed.slice(3))}
        </h2>
      );
      continue;
    }
    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h1 key={i} className="text-lg font-bold text-slate-900 dark:text-white mt-4 mb-2">
          {formatInline(trimmed.slice(2))}
        </h1>
      );
      continue;
    }

    // Bullet list items (- or * )
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList || isNumberedList) {
        flushList();
        inList = true;
        isNumberedList = false;
      }
      listItems.push(trimmed.slice(2));
      continue;
    }

    // Numbered list items (1. 2. )
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      if (!inList || !isNumberedList) {
        flushList();
        inList = true;
        isNumberedList = true;
      }
      listItems.push(numMatch[2]);
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      flushList();
      elements.push(
        <blockquote
          key={i}
          className="border-l-4 border-emerald-500 pl-3 my-2 text-slate-700 dark:text-slate-300 italic bg-emerald-50/50 dark:bg-emerald-950/20 py-1 rounded-r"
        >
          {formatInline(trimmed.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Regular paragraph line
    flushList();
    elements.push(
      <p key={i} className="my-1.5 leading-relaxed text-slate-800 dark:text-slate-200">
        {formatInline(trimmed)}
      </p>
    );
  }

  flushList();

  return <div className="text-xs sm:text-sm leading-relaxed space-y-1">{elements}</div>;
};
