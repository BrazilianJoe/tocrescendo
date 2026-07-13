import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { posts, type Post } from "@/db/schema";
import { slugify } from "@/lib/slug";

export async function listPublishedPosts(): Promise<Post[]> {
  if (!process.env.DATABASE_URL) return [];
  try {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.status, "PUBLISHED"))
      .orderBy(desc(posts.publishedAt));
  } catch (err) {
    console.error("listPublishedPosts failed:", err);
    return [];
  }
}

export async function getPublishedPostBySlug(
  slug: string,
): Promise<Post | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    const [post] = await db
      .select()
      .from(posts)
      .where(and(eq(posts.slug, slug), eq(posts.status, "PUBLISHED")))
      .limit(1);
    return post ?? null;
  } catch (err) {
    console.error("getPublishedPostBySlug failed:", err);
    return null;
  }
}

export async function listAllPosts(): Promise<Post[]> {
  return db.select().from(posts).orderBy(desc(posts.updatedAt));
}

export async function getPostById(id: string): Promise<Post | null> {
  const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  return post ?? null;
}

export async function ensureUniqueSlug(
  title: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(title) || "artigo";
  let candidate = base;
  let n = 2;

  for (;;) {
    const [existing] = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.slug, candidate))
      .limit(1);

    if (!existing || existing.id === excludeId) {
      return candidate;
    }
    candidate = `${base}-${n}`;
    n += 1;
  }
}

export { emptyDoc } from "@/lib/empty-doc";
