const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);

/** Safe for <a href> — http(s), mailto, or same-origin path. */
export function sanitizeHref(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value || value.length > 2048) return null;

  if (value.startsWith("/") && !value.startsWith("//")) {
    return value;
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
  if (!value || value.length > 2048) return null;

  if (value.startsWith("/uploads/") && !value.includes("..")) {
    return value;
  }

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function isAllowedCoverUrl(raw: string | null | undefined): boolean {
  if (raw == null || raw === "") return true;
  return sanitizeImageSrc(raw) !== null;
}
