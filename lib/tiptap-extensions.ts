import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";
import { sanitizeHref, sanitizeImageSrc } from "@/lib/safe-url";

/** Optimized image: AVIF + WebP sources for <picture>. */
export const OptimizedImage = Image.extend({
  name: "optimizedImage",
  addAttributes() {
    return {
      ...this.parent?.(),
      srcAvif: { default: null },
      srcWebp: { default: null },
      width: { default: null },
      height: { default: null },
    };
  },
  renderHTML({ HTMLAttributes }) {
    const src = sanitizeImageSrc(HTMLAttributes.src);
    const srcAvif = sanitizeImageSrc(HTMLAttributes.srcAvif);
    const srcWebp = sanitizeImageSrc(HTMLAttributes.srcWebp);
    if (!src && !srcAvif && !srcWebp) {
      return ["span", { class: "sr-only" }, ""];
    }

    const sizeAttrs: Record<string, string> = {};
    if (HTMLAttributes.width) sizeAttrs.width = String(HTMLAttributes.width);
    if (HTMLAttributes.height) sizeAttrs.height = String(HTMLAttributes.height);

    const imgAttrs: Record<string, string> = {
      src: srcWebp || src || srcAvif || "",
      alt: String(HTMLAttributes.alt ?? "").slice(0, 500),
      loading: "lazy",
      decoding: "async",
      ...sizeAttrs,
    };

    if (srcAvif || srcWebp) {
      const children: [string, Record<string, string>][] = [];
      if (srcAvif) {
        children.push(["source", { srcset: srcAvif, type: "image/avif" }]);
      }
      if (srcWebp) {
        children.push(["source", { srcset: srcWebp, type: "image/webp" }]);
      }
      children.push(["img", imgAttrs]);
      return ["picture", {}, ...children];
    }

    return ["img", imgAttrs];
  },
});

const SafeLink = Link.extend({
  renderHTML({ HTMLAttributes }) {
    const href = sanitizeHref(HTMLAttributes.href);
    if (!href) {
      return ["span", {}, 0];
    }
    return [
      "a",
      {
        ...HTMLAttributes,
        href,
        rel: "noopener noreferrer nofollow",
      },
      0,
    ];
  },
});

export function getTiptapExtensions() {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3] },
    }),
    SafeLink.configure({
      openOnClick: false,
      validate: (href) => sanitizeHref(href) !== null,
      HTMLAttributes: {
        class: "text-primary-dark underline underline-offset-2",
      },
    }),
    OptimizedImage.configure({
      allowBase64: false,
      HTMLAttributes: {
        class: "rounded-xl max-w-full h-auto",
      },
    }),
  ];
}
