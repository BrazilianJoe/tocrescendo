import { NextResponse } from "next/server";
import { db } from "@/db";
import { media } from "@/db/schema";
import { optimizeAndStoreImage } from "@/lib/images";
import { requireAdmin } from "@/lib/require-admin";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

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

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const optimized = await optimizeAndStoreImage(buffer);

    const [row] = await db
      .insert(media)
      .values({
        alt,
        avifUrl: optimized.avifUrl,
        webpUrl: optimized.webpUrl,
        width: String(optimized.width),
        height: String(optimized.height),
        uploadedById: session.user.id,
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
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha no upload";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
