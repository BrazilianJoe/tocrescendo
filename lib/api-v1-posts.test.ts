import { describe, expect, it } from "vitest";
import type { Post } from "@/db/schema";
import {
  createApiV1Post,
  createApiV1PostSchema,
  type ApiV1PostStore,
  updateApiV1Post,
  updateApiV1PostSchema,
} from "@/lib/api-v1-posts";
import { slugify } from "@/lib/slug";

const authorId = "00000000-0000-4000-8000-000000000001";
const now = new Date("2026-11-26T15:00:00.000Z");

function createMemoryStore(): ApiV1PostStore {
  const rows: Post[] = [];

  return {
    async create(values) {
      const post = {
        id: `00000000-0000-4000-8000-${String(rows.length + 1).padStart(12, "0")}`,
        createdAt: now,
        ...values,
      } as Post;
      rows.push(post);
      return post;
    },
    async find(idOrSlug) {
      return rows.find((post) => post.id === idOrSlug || post.slug === idOrSlug) ?? null;
    },
    async update(id, values) {
      const index = rows.findIndex((post) => post.id === id);
      if (index === -1) return null;
      rows[index] = { ...rows[index], ...values } as Post;
      return rows[index];
    },
    async remove(id) {
      const index = rows.findIndex((post) => post.id === id);
      if (index === -1) return false;
      rows.splice(index, 1);
      return true;
    },
    async list({ status, limit, offset }) {
      return rows
        .filter((post) => !status || post.status === status)
        .slice(offset, offset + limit);
    },
    async ensureUniqueSlug(value, excludeId) {
      const base = slugify(value) || "artigo";
      let candidate = base;
      let suffix = 2;
      while (
        rows.some((post) => post.slug === candidate && post.id !== excludeId)
      ) {
        candidate = `${base}-${suffix}`;
        suffix += 1;
      }
      return candidate;
    },
  };
}

describe("fluxo de publicação API v1", () => {
  it("cria rascunhos por padrão, mantém slug único e publica por PATCH", async () => {
    const store = createMemoryStore();
    const first = await createApiV1Post(
      createApiV1PostSchema.parse({
        title: "Rotina de estudos",
        content: "## Comece pequeno\n\nUma etapa por vez.",
      }),
      authorId,
      store,
      now,
    );
    const second = await createApiV1Post(
      createApiV1PostSchema.parse({ title: "Rotina de estudos" }),
      authorId,
      store,
      now,
    );

    expect(first.status).toBe("DRAFT");
    expect(first.publishedAt).toBeNull();
    expect(first.slug).toBe("rotina-de-estudos");
    expect(second.slug).toBe("rotina-de-estudos-2");
    expect(first.content).toMatchObject({ type: "doc" });

    const published = await updateApiV1Post(
      first,
      updateApiV1PostSchema.parse({
        summary: "Atualizado.",
        status: "PUBLISHED",
      }),
      store,
      now,
    );

    expect(published).toMatchObject({
      status: "PUBLISHED",
      summary: "Atualizado.",
      publishedAt: now,
    });
  });
});
