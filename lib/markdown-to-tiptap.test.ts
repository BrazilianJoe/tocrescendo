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
});
