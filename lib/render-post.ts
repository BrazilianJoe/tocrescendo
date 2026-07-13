import { generateHTML } from "@tiptap/html/server";
import type { JSONContent } from "@tiptap/core";
import { getTiptapExtensions } from "@/lib/tiptap-extensions";

export function renderPostHtml(content: unknown): string {
  try {
    return generateHTML(content as JSONContent, getTiptapExtensions());
  } catch {
    return "<p>Conteúdo indisponível.</p>";
  }
}
