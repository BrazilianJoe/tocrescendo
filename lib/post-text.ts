import type { JSONContent } from "@tiptap/core";

function walkText(node: JSONContent | undefined, parts: string[]): void {
  if (!node) return;
  if (typeof node.text === "string") {
    parts.push(node.text);
  }
  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      walkText(child, parts);
    }
  }
}

export function extractPlainText(content: unknown): string {
  const parts: string[] = [];
  walkText(content as JSONContent, parts);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export function readingTimeMinutes(content: unknown): number {
  const words = extractPlainText(content)
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function formatReadingTime(minutes: number): string {
  return minutes === 1 ? "1 min de leitura" : `${minutes} min de leitura`;
}

/** Prefer summary; fall back to truncated body text. */
export function postExcerpt(
  summary: string,
  content: unknown,
  maxChars: number,
): string {
  const fromSummary = summary.trim();
  if (fromSummary) {
    if (fromSummary.length <= maxChars) return fromSummary;
    return `${fromSummary.slice(0, maxChars).trimEnd()}…`;
  }

  const plain = extractPlainText(content);
  if (!plain) return "";
  if (plain.length <= maxChars) return plain;
  return `${plain.slice(0, maxChars).trimEnd()}…`;
}
