import { getSchema } from "@tiptap/core";
import { and, desc, eq, lte, or, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { posts, users, type Post } from "@/db/schema";
import { emptyDoc } from "@/lib/empty-doc";
import {
  isTiptapDocument,
  markdownToTiptap,
  type TiptapDocument,
} from "@/lib/markdown-to-tiptap";
import { ensureUniqueSlug } from "@/lib/posts";
import { isAllowedCoverUrl, sanitizeImageSrc } from "@/lib/safe-url";
import { getTiptapExtensions } from "@/lib/tiptap-extensions";

const MAX_CONTENT_CHARS = 500_000;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const tiptapSchema = getSchema(getTiptapExtensions());

const coverSchema = z.object({
  coverAvifUrl: z.string().nullable().optional(),
  coverWebpUrl: z.string().nullable().optional(),
  coverAlt: z.string().max(200).optional(),
});

const publishedAtSchema = z
  .union([z.string().datetime({ offset: true }), z.null()])
  .optional();

const sharedPostSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    summary: z.string().max(500).optional(),
    content: z.unknown().optional(),
    status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
    slug: z.string().trim().min(1).max(140).optional(),
    seoTitle: z.string().max(200).nullable().optional(),
    seoDescription: z.string().max(500).nullable().optional(),
    publishedAt: publishedAtSchema,
  })
  .merge(coverSchema)
  .strict();

export const createApiV1PostSchema = sharedPostSchema.extend({
  title: z.string().trim().min(1).max(200),
});

export const updateApiV1PostSchema = sharedPostSchema.refine(
  (value) => Object.keys(value).length > 0,
  "Envie ao menos um campo para atualizar",
);

export type ApiV1CreateInput = z.infer<typeof createApiV1PostSchema>;
export type ApiV1UpdateInput = z.infer<typeof updateApiV1PostSchema>;

export class ApiV1InputError extends Error {}

export class ApiV1ConflictError extends Error {}

type PostValues = {
  slug: string;
  title: string;
  summary: string;
  content: Record<string, unknown>;
  coverAvifUrl: string | null;
  coverWebpUrl: string | null;
  coverAlt: string;
  seoTitle: string | null;
  seoDescription: string | null;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: Date | null;
  authorId: string;
  updatedAt: Date;
};

export type ApiV1PostStore = {
  create(values: PostValues): Promise<Post>;
  update(existing: ApiV1PostRevision, values: Partial<PostValues>): Promise<Post>;
  ensureUniqueSlug(value: string, excludeId?: string): Promise<string>;
};

type ApiV1PostRevision = { post: Post; revision: string };

type ApiV1PostListOptions = {
  status?: Post["status"];
  limit: number;
  offset: number;
};

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

const postRevision = sql<string>`${posts}."xmin"::text`;

export const drizzleApiV1PostStore = {
  async create(values) {
    const [post] = await db.insert(posts).values(values).returning();
    return post;
  },
  async find(idOrSlug: string): Promise<ApiV1PostRevision | null> {
    const bySlug = eq(posts.slug, idOrSlug);
    const byId = isUuid(idOrSlug) ? eq(posts.id, idOrSlug) : undefined;
    const query = db
      .select({ post: posts, revision: postRevision })
      .from(posts)
      .where(byId ? or(byId, bySlug) : bySlug)
      .limit(1);
    const [result] = await (byId ? query.orderBy(desc(byId)) : query);
    return result ?? null;
  },
  async update({ post: existing, revision }, values) {
    const [post] = await db
      .update(posts)
      .set(values)
      .where(and(eq(posts.id, existing.id), eq(postRevision, revision)))
      .returning();
    if (!post) {
      throw new ApiV1ConflictError("O artigo foi alterado ou excluído. Consulte-o novamente");
    }
    return post;
  },
  async remove(id: string) {
    const [deleted] = await db
      .delete(posts)
      .where(eq(posts.id, id))
      .returning({ status: posts.status, slug: posts.slug });
    return deleted ?? null;
  },
  async list({ status, limit, offset }: ApiV1PostListOptions) {
    return db
      .select()
      .from(posts)
      .where(status ? eq(posts.status, status) : undefined)
      .orderBy(desc(posts.updatedAt), desc(posts.id))
      .limit(limit)
      .offset(offset);
  },
  ensureUniqueSlug,
} satisfies ApiV1PostStore & {
  find(idOrSlug: string): Promise<ApiV1PostRevision | null>;
  list(options: ApiV1PostListOptions): Promise<Post[]>;
  remove(id: string): Promise<Pick<Post, "status" | "slug"> | null>;
};

export function isApiV1PostConflict(error: unknown): boolean {
  if (error instanceof ApiV1ConflictError) return true;
  const cause = error instanceof Error ? error.cause : undefined;
  return (
    typeof cause === "object" && cause !== null &&
    "code" in cause && cause.code === "23505" &&
    "constraint" in cause && cause.constraint === "posts_slug_unique"
  );
}

function jsonSize(value: unknown): number {
  try {
    return JSON.stringify(value).length;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

function normalizeContent(value: unknown | undefined): TiptapDocument {
  if (typeof value === "string" && value.length > MAX_CONTENT_CHARS) {
    throw new ApiV1InputError("Conteúdo maior que 500.000 caracteres");
  }
  const content = typeof value === "string"
    ? markdownToTiptap(value)
    : value === undefined ? emptyDoc : value;
  if (!isTiptapDocument(content) || jsonSize(content) > MAX_CONTENT_CHARS) {
    throw new ApiV1InputError("Conteúdo TipTap inválido ou grande demais");
  }
  try {
    tiptapSchema.nodeFromJSON(content).check();
  } catch {
    throw new ApiV1InputError("Conteúdo TipTap inválido");
  }
  return content;
}

function normalizeCoverUrl(value: string | null | undefined): string | null {
  if (value == null || value === "") return null;
  return sanitizeImageSrc(value);
}

function ensureCoverUrls(input: {
  coverAvifUrl?: string | null;
  coverWebpUrl?: string | null;
}): void {
  if (
    !isAllowedCoverUrl(input.coverAvifUrl) ||
    !isAllowedCoverUrl(input.coverWebpUrl)
  ) {
    throw new ApiV1InputError("URL de capa inválida");
  }
}

function parsePublishedAt(value: string | null | undefined): Date | null | undefined {
  if (value === undefined || value === null) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ApiV1InputError("publishedAt inválido");
  }
  return date;
}

function assertFutureSchedule(date: Date | null | undefined, now: Date): void {
  if (date && date.getTime() <= now.getTime()) {
    throw new ApiV1InputError(
      "Um rascunho agendado precisa ter publishedAt no futuro",
    );
  }
}

function assertNotFuturePublication(date: Date | null | undefined, now: Date): void {
  if (date && date.getTime() > now.getTime()) {
    throw new ApiV1InputError(
      "Para agendar, mantenha o status DRAFT e informe publishedAt no futuro",
    );
  }
}

function nextPublishedAt({
  existing,
  requested,
  status,
  now,
}: {
  existing?: Post;
  requested: Date | null | undefined;
  status: "DRAFT" | "PUBLISHED";
  now: Date;
}): Date | null {
  if (status === "PUBLISHED") {
    const value = requested === undefined && existing?.status === "PUBLISHED"
      ? existing.publishedAt
      : requested;
    assertNotFuturePublication(value, now);
    return value ?? now;
  }

  assertFutureSchedule(requested, now);
  if (requested !== undefined) return requested;
  return existing?.status === "DRAFT" ? existing.publishedAt : null;
}

export async function getApiV1AuthorId(): Promise<string | null> {
  const authorId = process.env.API_V1_AUTHOR_ID?.trim();
  if (!authorId || !isUuid(authorId)) return null;
  const [author] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.id, authorId), eq(users.role, "ADMIN")))
    .limit(1);
  return author?.id ?? null;
}

export async function createApiV1Post(
  input: ApiV1CreateInput,
  authorId: string,
  store: ApiV1PostStore = drizzleApiV1PostStore,
  now = new Date(),
): Promise<Post> {
  ensureCoverUrls(input);
  const status = input.status ?? "DRAFT";
  const publishedAt = nextPublishedAt({
    requested: parsePublishedAt(input.publishedAt),
    status,
    now,
  });
  const slug = await store.ensureUniqueSlug(input.slug || input.title);

  return store.create({
    title: input.title,
    summary: input.summary ?? "",
    content: normalizeContent(input.content) as Record<string, unknown>,
    coverAvifUrl: normalizeCoverUrl(input.coverAvifUrl),
    coverWebpUrl: normalizeCoverUrl(input.coverWebpUrl),
    coverAlt: input.coverAlt ?? "",
    seoTitle: input.seoTitle ?? null,
    seoDescription: input.seoDescription ?? null,
    status,
    publishedAt,
    authorId,
    updatedAt: now,
    slug,
  });
}

export async function updateApiV1Post(
  current: ApiV1PostRevision,
  input: ApiV1UpdateInput,
  store: ApiV1PostStore = drizzleApiV1PostStore,
  now = new Date(),
): Promise<Post> {
  ensureCoverUrls(input);
  const { post: existing } = current;
  const title = input.title ?? existing.title;
  const slug = input.slug
    ? await store.ensureUniqueSlug(input.slug, existing.id)
    : input.title && input.title !== existing.title
      ? await store.ensureUniqueSlug(input.title, existing.id)
      : existing.slug;
  const status = input.status ?? existing.status;
  const publishedAt = nextPublishedAt({
    existing,
    requested: parsePublishedAt(input.publishedAt),
    status,
    now,
  });

  return store.update(current, {
    title,
    summary: input.summary ?? existing.summary,
    content:
      input.content === undefined
        ? existing.content
        : (normalizeContent(input.content) as Record<string, unknown>),
    coverAvifUrl:
      input.coverAvifUrl === undefined
        ? existing.coverAvifUrl
        : normalizeCoverUrl(input.coverAvifUrl),
    coverWebpUrl:
      input.coverWebpUrl === undefined
        ? existing.coverWebpUrl
        : normalizeCoverUrl(input.coverWebpUrl),
    coverAlt: input.coverAlt ?? existing.coverAlt,
    seoTitle: input.seoTitle === undefined ? existing.seoTitle : input.seoTitle,
    seoDescription:
      input.seoDescription === undefined
        ? existing.seoDescription
        : input.seoDescription,
    status,
    slug,
    publishedAt,
    updatedAt: now,
  });
}

export async function publishDueApiV1Posts(now = new Date()): Promise<Array<{ slug: string }>> {
  const duePosts = await db
    .update(posts)
    .set({ status: "PUBLISHED", updatedAt: now })
    .where(
      and(eq(posts.status, "DRAFT"), lte(posts.publishedAt, now)),
    )
    .returning({ slug: posts.slug });

  return duePosts;
}
