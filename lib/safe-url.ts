const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);
const LOCAL_ORIGIN = "https://local.invalid";
const INVALID_URL_CHARS = /[\\\s\p{Cc}]/u;

/** Safe for <a href> — http(s), mailto, or same-origin path. */
export function sanitizeHref(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value || value.length > 2048) return null;

  if (value.startsWith("/") && !value.startsWith("//")) {
    return INVALID_URL_CHARS.test(value) ? null : value;
  }

  try {
    const url = new URL(value);
    if (!ALLOWED_PROTOCOLS.has(url.protocol)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** Safe for <img src> / picture sources — http(s) or /uploads/… */
export function sanitizeImageSrc(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value || value.length > 2048 || INVALID_URL_CHARS.test(value)) {
    return null;
  }

  if (value.startsWith("/uploads/")) {
    const url = new URL(value, LOCAL_ORIGIN);
    if (!url.pathname.startsWith("/uploads/")) return null;
    // Reject encoded path delimiters and nested encodings before origin decoding.
    if (/%(?:2f|5c|25)/i.test(url.pathname)) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  }

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function isAllowedCoverUrl(raw: string | null | undefined): boolean {
  if (raw == null || raw === "") return true;
  return sanitizeImageSrc(raw) !== null;
}
