import { NextResponse } from "next/server";
import { db } from "@/db";
import { media } from "@/db/schema";
import { isApiV1Authorized } from "@/lib/api-v1-auth";
import { getApiV1AuthorId } from "@/lib/api-v1-posts";
import { optimizeAndStoreImage } from "@/lib/images";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

function unauthorized() {
  return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
}

export async function POST(request: Request) {
  if (!isApiV1Authorized(request)) return unauthorized();

  const authorId = getApiV1AuthorId();
  if (!authorId) {
    return NextResponse.json(
      { error: "API de publicação não configurada" },
      { status: 503 },
    );
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    const alt = String(form.get("alt") ?? "").slice(0, 200);

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Arquivo obrigatório" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Envie uma imagem" }, { status: 400 });
    }
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Imagem maior que 8 MB" },
        { status: 400 },
      );
    }

    const optimized = await optimizeAndStoreImage(
      Buffer.from(await file.arrayBuffer()),
    );
    const [row] = await db
      .insert(media)
      .values({
        alt,
        avifUrl: optimized.avifUrl,
        webpUrl: optimized.webpUrl,
        width: String(optimized.width),
        height: String(optimized.height),
        uploadedById: authorId,
      })
      .returning();

    return NextResponse.json({
      id: row.id,
      alt: row.alt,
      src: optimized.webpUrl,
      srcAvif: optimized.avifUrl,
      srcWebp: optimized.webpUrl,
      width: optimized.width,
      height: optimized.height,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha no upload";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
