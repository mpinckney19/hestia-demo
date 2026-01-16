import React from 'react';

/**
 * Lightweight markdown renderer for basic formatting.
 * Handles: **bold**, *italic*, # headers, - lists
 */
export function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const result: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  let inList = false;

  const processInlineFormatting = (line: string, key: string): React.ReactNode => {
    // Process inline formatting: **bold** and *italic*
    const parts: React.ReactNode[] = [];
    let remaining = line;
    let partIndex = 0;

    while (remaining.length > 0) {
      // Match **bold** first (must come before single *)
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      // Match *italic* (single asterisk, not followed/preceded by another *)
      const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);

      // Find the earliest match
      let earliestMatch: { match: RegExpMatchArray; type: 'bold' | 'italic' } | null = null;

      if (boldMatch && boldMatch.index !== undefined) {
        earliestMatch = { match: boldMatch, type: 'bold' };
      }

      if (italicMatch && italicMatch.index !== undefined) {
        if (!earliestMatch || (italicMatch.index < earliestMatch.match.index!)) {
          earliestMatch = { match: italicMatch, type: 'italic' };
        }
      }

      if (earliestMatch) {
        const { match, type } = earliestMatch;
        const index = match.index!;

        // Add text before the match
        if (index > 0) {
          parts.push(remaining.slice(0, index));
        }

        // Add the formatted text
        if (type === 'bold') {
          parts.push(
            <strong key={`${key}-bold-${partIndex}`} className="font-semibold text-stone-200">
              {match[1]}
            </strong>
          );
        } else {
          parts.push(
            <em key={`${key}-italic-${partIndex}`} className="italic text-stone-300">
              {match[1]}
            </em>
          );
        }

        remaining = remaining.slice(index + match[0].length);
        partIndex++;
      } else {
        // No more matches, add the rest
        if (remaining) {
          parts.push(remaining);
        }
        break;
      }
    }

    return parts.length > 0 ? <>{parts}</> : line;
  };

  const flushList = (key: number) => {
    if (listItems.length > 0) {
      result.push(
        <ul key={`list-${key}`} className="space-y-1.5 my-2">
          {listItems}
        </ul>
      );
      listItems = [];
    }
    inList = false;
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Skip empty lines but flush any pending list
    if (!trimmedLine) {
      flushList(index);
      return;
    }

    // Check for headers (# ## ### etc.)
    const headerMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      flushList(index);
      const level = headerMatch[1].length;
      const content = processInlineFormatting(headerMatch[2], `header-${index}`);

      if (level === 1) {
        result.push(
          <h3 key={`h-${index}`} className="text-lg font-semibold text-stone-200 mt-4 mb-2 first:mt-0">
            {content}
          </h3>
        );
      } else if (level === 2) {
        result.push(
          <h4 key={`h-${index}`} className="text-base font-semibold text-stone-200 mt-3 mb-1.5 first:mt-0">
            {content}
          </h4>
        );
      } else {
        result.push(
          <h5 key={`h-${index}`} className="text-sm font-medium text-stone-300 mt-2 mb-1 first:mt-0">
            {content}
          </h5>
        );
      }
      return;
    }

    // Check for list items (- or * or numbered)
    const listMatch = trimmedLine.match(/^[-*•]\s+(.+)$/) || trimmedLine.match(/^\d+[.)]\s+(.+)$/);
    if (listMatch) {
      inList = true;
      const content = processInlineFormatting(listMatch[1], `li-${index}`);
      listItems.push(
        <li key={`li-${index}`} className="flex items-start gap-2">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-stone-500 shrink-0" />
          <span className="text-stone-300">{content}</span>
        </li>
      );
      return;
    }

    // Regular paragraph - flush any pending list first
    flushList(index);
    const content = processInlineFormatting(trimmedLine, `p-${index}`);
    result.push(
      <p key={`p-${index}`} className="text-stone-300 my-1.5">
        {content}
      </p>
    );
  });

  // Flush any remaining list items
  flushList(lines.length);

  return result;
}
