import { describe, expect, it } from "vitest";
import { renderPostHtml } from "@/lib/render-post";
import {
  isAllowedCoverUrl,
  sanitizeHref,
  sanitizeImageSrc,
} from "@/lib/safe-url";

describe("sanitizeHref", () => {
  it("allows https and http", () => {
    expect(sanitizeHref("https://tocrescendo.com.br/blog")).toContain(
      "https://",
    );
    expect(sanitizeHref("http://example.com")).toContain("http://");
  });

  it("allows mailto and relative paths", () => {
    expect(sanitizeHref("mailto:a@b.com")).toBe("mailto:a@b.com");
    expect(sanitizeHref("/blog/foo")).toBe("/blog/foo");
  });

  it("rejects javascript and data URLs", () => {
    expect(sanitizeHref("javascript:alert(1)")).toBeNull();
    expect(sanitizeHref("data:text/html,<script>")).toBeNull();
    expect(sanitizeHref("//evil.com")).toBeNull();
  });
});

describe("sanitizeImageSrc", () => {
  it("allows https and /uploads paths", () => {
    expect(sanitizeImageSrc("https://cdn.example.com/a.webp")).toContain(
      "https://",
    );
    expect(sanitizeImageSrc("/uploads/abc.webp")).toBe("/uploads/abc.webp");
  });

  it("rejects path traversal and dangerous schemes", () => {
    expect(sanitizeImageSrc("/uploads/../secret")).toBeNull();
    expect(sanitizeImageSrc("javascript:alert(1)")).toBeNull();
    expect(sanitizeImageSrc("data:image/png;base64,xxx")).toBeNull();
  });
});

describe("isAllowedCoverUrl", () => {
  it("allows empty/null and safe URLs", () => {
    expect(isAllowedCoverUrl(null)).toBe(true);
    expect(isAllowedCoverUrl("")).toBe(true);
    expect(isAllowedCoverUrl("https://x.com/a.webp")).toBe(true);
  });

  it("rejects unsafe cover URLs", () => {
    expect(isAllowedCoverUrl("javascript:alert(1)")).toBe(false);
  });
});

describe("renderPostHtml XSS hardening", () => {
  it("does not emit javascript: links", () => {
    const html = renderPostHtml({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "click",
              marks: [
                {
                  type: "link",
                  attrs: { href: "javascript:alert(1)" },
                },
              ],
            },
          ],
        },
      ],
    });

    expect(html.toLowerCase()).not.toContain("javascript:");
    expect(html).not.toMatch(/<a[^>]+href=["']javascript:/i);
  });

  it("keeps safe https links", () => {
    const html = renderPostHtml({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "site",
              marks: [
                {
                  type: "link",
                  attrs: { href: "https://tocrescendo.com.br" },
                },
              ],
            },
          ],
        },
      ],
    });

    expect(html).toContain("https://tocrescendo.com.br");
    expect(html).toContain("<a");
  });

  it("drops unsafe image sources", () => {
    const html = renderPostHtml({
      type: "doc",
      content: [
        {
          type: "optimizedImage",
          attrs: {
            src: "javascript:alert(1)",
            srcAvif: null,
            srcWebp: null,
            alt: "x",
          },
        },
      ],
    });

    expect(html.toLowerCase()).not.toContain("javascript:");
    expect(html).not.toMatch(/<img[^>]+src=["']javascript:/i);
  });

  it("escapes HTML in plain text nodes", () => {
    const html = renderPostHtml({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: '<script>alert("xss")</script>' }],
        },
      ],
    });

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
