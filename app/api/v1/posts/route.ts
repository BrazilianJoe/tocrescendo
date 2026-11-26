import { NextResponse } from "next/server";
import { z } from "zod";
import { isApiV1Authorized } from "@/lib/api-v1-auth";
import {
  ApiV1InputError,
  createApiV1Post,
  createApiV1PostSchema,
  drizzleApiV1PostStore,
  getApiV1AuthorId,
  isApiV1PostConflict,
} from "@/lib/api-v1-posts";
import { revalidatePostPages } from "@/lib/revalidate-posts";

export const runtime = "nodejs";

const listSchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  page: z.coerce.number().int().min(1).max(Math.floor(Number.MAX_SAFE_INTEGER / 100)).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

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

export async function GET(request: Request) {
  if (!isApiV1Authorized(request)) return unauthorized();

  const query = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = listSchema.safeParse(query);
  if (!parsed.success) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  const { status, page, pageSize } = parsed.data;
  const rows = await drizzleApiV1PostStore.list({
    status,
    limit: pageSize + 1,
    offset: (page - 1) * pageSize,
  });
  const hasMore = rows.length > pageSize;
  const pagination = { page, pageSize, hasMore, nextPage: hasMore ? page + 1 : null };
  const encoder = new TextEncoder();
  // Full articles can exceed Vercel's buffered response limit.
  function* jsonChunks() {
    yield encoder.encode('{"data":[');
    for (const [index, post] of rows.slice(0, pageSize).entries()) {
      yield encoder.encode(`${index ? "," : ""}${JSON.stringify(post)}`);
    }
    yield encoder.encode(`],"pagination":${JSON.stringify(pagination)}}`);
  }
  const chunks = jsonChunks();
  const body = new ReadableStream<Uint8Array>({
    pull(controller) {
      const chunk = chunks.next();
      if (chunk.done) controller.close();
      else controller.enqueue(chunk.value);
    },
  });
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "private, no-store",
    },
  });
}

export async function POST(request: Request) {
  if (!isApiV1Authorized(request)) return unauthorized();

  const parsed = createApiV1PostSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  try {
    const authorId = await getApiV1AuthorId();
    if (!authorId) {
      return NextResponse.json(
        { error: "API de publicação não configurada" },
        { status: 503 },
      );
    }
    const post = await createApiV1Post(parsed.data, authorId);
    if (post.status === "PUBLISHED") revalidatePostPages(post);
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    if (error instanceof ApiV1InputError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (isApiV1PostConflict(error)) {
      return NextResponse.json({ error: "Slug em uso. Tente novamente" }, { status: 409 });
    }
    return NextResponse.json({ error: "Não foi possível criar o artigo" }, { status: 500 });
  }
}
