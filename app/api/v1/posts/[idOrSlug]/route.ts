import { NextResponse } from "next/server";
import { isApiV1Authorized } from "@/lib/api-v1-auth";
import {
  ApiV1InputError,
  drizzleApiV1PostStore,
  isApiV1PostConflict,
  updateApiV1Post,
  updateApiV1PostSchema,
} from "@/lib/api-v1-posts";
import { revalidatePostPages } from "@/lib/revalidate-posts";

export const runtime = "nodejs";

type Params = { params: Promise<{ idOrSlug: string }> };

function unauthorized() {
  return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
}

async function readJson(request: Request): Promise<unknown | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function GET(request: Request, { params }: Params) {
  if (!isApiV1Authorized(request)) return unauthorized();

  const { idOrSlug } = await params;
  const result = await drizzleApiV1PostStore.find(idOrSlug);
  if (!result) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
  return NextResponse.json(result.post, {
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function PATCH(request: Request, { params }: Params) {
  if (!isApiV1Authorized(request)) return unauthorized();

  const { idOrSlug } = await params;
  const parsed = updateApiV1PostSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  try {
    const current = await drizzleApiV1PostStore.find(idOrSlug);
    if (!current) {
      return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    }
    const { post: existing } = current;
    const post = await updateApiV1Post(current, parsed.data);
    if (existing.status === "PUBLISHED" || post.status === "PUBLISHED") {
      revalidatePostPages(post, existing.slug);
    }
    return NextResponse.json(post);
  } catch (error) {
    if (error instanceof ApiV1InputError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (isApiV1PostConflict(error)) {
      return NextResponse.json(
        { error: "O artigo ou slug mudou. Consulte-o novamente" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Não foi possível atualizar o artigo" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  if (!isApiV1Authorized(request)) return unauthorized();

  const { idOrSlug } = await params;
  const existing = await drizzleApiV1PostStore.find(idOrSlug);
  if (!existing) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  const deleted = await drizzleApiV1PostStore.remove(existing.post.id);
  if (!deleted) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
  if (deleted.status === "PUBLISHED") revalidatePostPages(deleted);
  return NextResponse.json({ ok: true });
}
