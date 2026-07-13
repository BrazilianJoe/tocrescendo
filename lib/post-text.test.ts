import { describe, expect, it } from "vitest";
import {
  formatReadingTime,
  postExcerpt,
  readingTimeMinutes,
} from "@/lib/post-text";

describe("post-text helpers", () => {
  it("computes at least 1 minute of reading time", () => {
    expect(
      readingTimeMinutes({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Olá" }],
          },
        ],
      }),
    ).toBe(1);
  });

  it("formats reading time in Portuguese", () => {
    expect(formatReadingTime(1)).toBe("1 min de leitura");
    expect(formatReadingTime(5)).toBe("5 min de leitura");
  });

  it("prefers summary for excerpts", () => {
    expect(
      postExcerpt("Resumo curto", { type: "doc", content: [] }, 100),
    ).toBe("Resumo curto");
  });
});
