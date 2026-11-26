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
    async update({ post: existing }, values) {
      const index = rows.findIndex((post) => post.id === existing.id);
      rows[index] = { ...rows[index], ...values } as Post;
      return rows[index];
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
    expect(first.authorId).toBe(authorId);
    expect(first.slug).toBe("rotina-de-estudos");
    expect(second.slug).toBe("rotina-de-estudos-2");
    expect(first.content).toMatchObject({ type: "doc" });

    const published = await updateApiV1Post(
      { post: first, revision: "1" },
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

  it("edita rascunhos vencidos e permite antecipar ou cancelar um agendamento", async () => {
    const store = createMemoryStore();
    const scheduled = await createApiV1Post(
      createApiV1PostSchema.parse({ title: "Agendado", publishedAt: "2026-11-26T13:00:00-03:00" }),
      authorId,
      store,
      now,
    );
    const current = { post: scheduled, revision: "1" };
    const overdue = new Date("2026-11-26T17:00:00.000Z");
    const edited = await updateApiV1Post(current, { summary: "Editado" }, store, overdue);
    expect(edited).toMatchObject({
      status: "DRAFT",
      publishedAt: new Date("2026-11-26T16:00:00.000Z"),
    });
    await expect(updateApiV1Post(current, { status: "PUBLISHED" }, store, now))
      .resolves.toMatchObject({ status: "PUBLISHED", publishedAt: now });
    await expect(updateApiV1Post(current, { publishedAt: null }, store, now))
      .resolves.toMatchObject({ status: "DRAFT", publishedAt: null });
    await expect(updateApiV1Post(
      current,
      { status: "PUBLISHED", publishedAt: "2026-11-26T16:00:00.000Z" },
      store,
      now,
    )).rejects.toThrow(/mantenha o status DRAFT/);
  });

  it("rejeita documentos TipTap fora do schema do editor", async () => {
    const input = createApiV1PostSchema.parse({
      title: "Artigo",
      content: { type: "doc", content: [{ type: "unknown" }] },
    });
    await expect(createApiV1Post(input, authorId, createMemoryStore(), now))
      .rejects.toThrow("Conteúdo TipTap inválido");
  });
});
