import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { emptyDoc } from "@/lib/empty-doc";
import { ensureUniqueSlug, listAllPosts } from "@/lib/posts";
import { requireAdmin } from "@/lib/require-admin";
import { isAllowedCoverUrl, sanitizeImageSrc } from "@/lib/safe-url";

const MAX_CONTENT_CHARS = 500_000;

const coverSchema = z.object({
  coverAvifUrl: z.string().nullable().optional(),
  coverWebpUrl: z.string().nullable().optional(),
  coverAlt: z.string().max(200).optional(),
});

const createSchema = z
  .object({
    title: z.string().min(1).max(200),
    summary: z.string().max(500).optional(),
    content: z.unknown().optional(),
    status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
    slug: z.string().min(1).max(140).optional(),
  })
  .merge(coverSchema);

function normalizeCoverUrl(raw: string | null | undefined): string | null {
  if (raw == null || raw === "") return null;
  return sanitizeImageSrc(raw);
}

function contentTooLarge(content: unknown): boolean {
  try {
    return JSON.stringify(content).length > MAX_CONTENT_CHARS;
  } catch {
    return true;
  }
}

function invalidCover(
  avif: string | null | undefined,
  webp: string | null | undefined,
): boolean {
  return !isAllowedCoverUrl(avif ?? null) || !isAllowedCoverUrl(webp ?? null);
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const rows = await listAllPosts();
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const {
    title,
    summary = "",
    content = emptyDoc,
    status = "DRAFT",
    slug: slugInput,
    coverAvifUrl = null,
    coverWebpUrl = null,
    coverAlt = "",
  } = parsed.data;

  if (contentTooLarge(content) || invalidCover(coverAvifUrl, coverWebpUrl)) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const slug = await ensureUniqueSlug(slugInput?.trim() || title);
  const now = new Date();

  const [post] = await db
    .insert(posts)
    .values({
      title,
      summary,
      slug,
      content: content as Record<string, unknown>,
      coverAvifUrl: normalizeCoverUrl(coverAvifUrl),
      coverWebpUrl: normalizeCoverUrl(coverWebpUrl),
      coverAlt,
      status,
      publishedAt: status === "PUBLISHED" ? now : null,
      authorId: session.user.id,
      updatedAt: now,
    })
    .returning();

  return NextResponse.json(post, { status: 201 });
}

export async function PATCH(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const schema = createSchema.extend({
    id: z.string().uuid(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const {
    id,
    title,
    summary,
    content,
    status,
    slug: slugInput,
    coverAvifUrl,
    coverWebpUrl,
    coverAlt,
  } = parsed.data;

  if (
    (content !== undefined && contentTooLarge(content)) ||
    invalidCover(coverAvifUrl, coverWebpUrl)
  ) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const [existing] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  const slug = slugInput
    ? await ensureUniqueSlug(slugInput, id)
    : title !== existing.title
      ? await ensureUniqueSlug(title, id)
      : existing.slug;

  const nextStatus = status ?? existing.status;
  let publishedAt = existing.publishedAt;
  if (nextStatus === "PUBLISHED" && !publishedAt) {
    publishedAt = new Date();
  }
  if (nextStatus === "DRAFT") {
    publishedAt = null;
  }

  const [post] = await db
    .update(posts)
    .set({
      title,
      summary: summary ?? existing.summary,
      content:
        (content as Record<string, unknown> | undefined) ?? existing.content,
      coverAvifUrl:
        coverAvifUrl === undefined
          ? existing.coverAvifUrl
          : normalizeCoverUrl(coverAvifUrl),
      coverWebpUrl:
        coverWebpUrl === undefined
          ? existing.coverWebpUrl
          : normalizeCoverUrl(coverWebpUrl),
      coverAlt: coverAlt ?? existing.coverAlt,
      status: nextStatus,
      slug,
      publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, id))
    .returning();

  return NextResponse.json(post);
}
