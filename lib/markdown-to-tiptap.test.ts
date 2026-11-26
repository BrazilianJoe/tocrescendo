import { describe, expect, it } from "vitest";
import { markdownToTiptap } from "@/lib/markdown-to-tiptap";

describe("markdownToTiptap", () => {
  it("converte títulos, links e listas em JSON TipTap", () => {
    const document = markdownToTiptap(
      "# Título\n\nTexto com [link](https://example.com).\n\n- primeiro\n- segundo",
    );

    expect(document).toMatchObject({
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 2 } },
        { type: "paragraph" },
        { type: "bulletList" },
      ],
    });
    expect(JSON.stringify(document)).toContain("https://example.com");
  });

  it("mantém separadores, a numeração inicial e blocos de código vazios", () => {
    const document = markdownToTiptap("Parágrafo\n---\n3. Terceiro\n4. Quarto\n\n```\n\n```");
    expect(document.content.map(({ type }) => type)).toEqual([
      "paragraph", "horizontalRule", "orderedList", "codeBlock",
    ]);
    expect(document.content[2].attrs).toEqual({ start: 3 });
    expect(document.content[3].content).toBeUndefined();
  });
});
