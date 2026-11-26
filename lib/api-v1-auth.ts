import { createHash, timingSafeEqual } from "node:crypto";

function bearerToken(authorization: string | null): string | null {
  if (!authorization) return null;
  const match = /^Bearer +([^\s,]+)$/i.exec(authorization);
  return match?.[1] ?? null;
}

function tokenDigest(token: string): Buffer {
  return createHash("sha256").update(token).digest();
}

export function hashApiV1Token(token: string): string {
  return tokenDigest(token).toString("hex");
}

/**
 * Checks a SHA-256 token hash without making API configuration mandatory at
 * application startup. A missing or malformed environment value is rejected.
 */
export function isApiV1Authorized(request: Request): boolean {
  const token = bearerToken(request.headers.get("authorization"));
  const configuredHash = process.env.API_V1_TOKEN_HASH?.trim();

  if (!token || !configuredHash || !/^[a-f0-9]{64}$/i.test(configuredHash)) {
    return false;
  }

  return timingSafeEqual(
    tokenDigest(token),
    Buffer.from(configuredHash, "hex"),
  );
}

/** Vercel Cron sends its secret as a Bearer token. */
export function isCronAuthorized(request: Request): boolean {
  const token = bearerToken(request.headers.get("authorization"));
  const configuredSecret = process.env.CRON_SECRET;

  if (!token || !configuredSecret) return false;

  return timingSafeEqual(tokenDigest(token), tokenDigest(configuredSecret));
}
