const HORIZONTAL_RULE = /^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/;
const ORDERED_ITEM = /^(\d{1,9})[.)]\s+(.+)$/;

type TiptapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
};

export type TiptapDocument = {
  type: "doc";
  content: TiptapNode[];
};

function textNode(text: string, marks?: TiptapNode["marks"]): TiptapNode {
  return { type: "text", text, ...(marks?.length ? { marks } : {}) };
}

/**
 * Converts the Markdown constructs useful in articles to the JSON shape used
 * by the installed TipTap extensions. Raw HTML is deliberately plain text.
 */
function inlineNodes(value: string): TiptapNode[] {
  const nodes: TiptapNode[] = [];
  const pattern = /\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*|_([^_]+)_|`([^`]+)`|\[([^\][\n]+)\]\((https?:\/\/[^\s()]+)\)/g;
  let cursor = 0;

  for (const match of value.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > cursor) nodes.push(textNode(value.slice(cursor, index)));

    if (match[1] || match[2]) {
      nodes.push(textNode(match[1] || match[2], [{ type: "bold" }]));
    } else if (match[3] || match[4]) {
      nodes.push(textNode(match[3] || match[4], [{ type: "italic" }]));
    } else if (match[5]) {
      nodes.push(textNode(match[5], [{ type: "code" }]));
    } else {
      nodes.push(
        textNode(match[6], [{ type: "link", attrs: { href: match[7] } }]),
      );
    }
    cursor = index + match[0].length;
  }

  if (cursor < value.length) nodes.push(textNode(value.slice(cursor)));
  return nodes;
}

function paragraph(value: string): TiptapNode {
  const content = inlineNodes(value.trim());
  return { type: "paragraph", ...(content.length ? { content } : {}) };
}

function listItem(value: string): TiptapNode {
  return { type: "listItem", content: [paragraph(value)] };
}

export function markdownToTiptap(markdown: string): TiptapDocument {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const content: TiptapNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (/^```/.test(line)) {
      const language = line.slice(3).trim() || null;
      index += 1;
      const code: string[] = [];
      while (index < lines.length && !/^```/.test(lines[index])) {
        code.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) index += 1;
      const codeText = code.join("\n");
      content.push({
        type: "codeBlock",
        attrs: { language },
        content: codeText ? [textNode(codeText)] : undefined,
      });
      continue;
    }

    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading) {
      content.push({
        type: "heading",
        attrs: { level: Math.min(3, Math.max(2, heading[1].length)) },
        content: inlineNodes(heading[2]),
      });
      index += 1;
      continue;
    }

    if (HORIZONTAL_RULE.test(line)) {
      content.push({ type: "horizontalRule" });
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quoted: string[] = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quoted.push(lines[index].replace(/^>\s?/, ""));
        index += 1;
      }
      content.push({ type: "blockquote", content: [paragraph(quoted.join(" "))] });
      continue;
    }

    const bullet = /^[-*+]\s+(.+)$/.exec(line);
    if (bullet) {
      const items: TiptapNode[] = [];
      while (index < lines.length) {
        const item = /^[-*+]\s+(.+)$/.exec(lines[index]);
        if (!item) break;
        items.push(listItem(item[1]));
        index += 1;
      }
      content.push({ type: "bulletList", content: items });
      continue;
    }

    const ordered = ORDERED_ITEM.exec(line);
    if (ordered) {
      const items: TiptapNode[] = [];
      while (index < lines.length) {
        const item = ORDERED_ITEM.exec(lines[index]);
        if (!item) break;
        items.push(listItem(item[2]));
        index += 1;
      }
      content.push({
        type: "orderedList",
        attrs: { start: Number(ordered[1]) },
        content: items,
      });
      continue;
    }

    const linesInParagraph = [line.trim()];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !HORIZONTAL_RULE.test(lines[index]) &&
      !ORDERED_ITEM.test(lines[index]) &&
      !/^(```|#{1,6}\s+|>\s?|[-*+]\s+)/.test(lines[index])
    ) {
      linesInParagraph.push(lines[index].trim());
      index += 1;
    }
    content.push(paragraph(linesInParagraph.join(" ")));
  }

  return { type: "doc", content: content.length ? content : [{ type: "paragraph" }] };
}

export function isTiptapDocument(value: unknown): value is TiptapDocument {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const document = value as { type?: unknown; content?: unknown };
  return (
    document.type === "doc" &&
    Array.isArray(document.content)
  );
}
