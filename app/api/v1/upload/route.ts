import { NextResponse } from "next/server";
import { db } from "@/db";
import { media } from "@/db/schema";
import { isApiV1Authorized } from "@/lib/api-v1-auth";
import { getApiV1AuthorId } from "@/lib/api-v1-posts";
import { InvalidImageError, isAllowedImageType, optimizeAndStoreImage } from "@/lib/images";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 4 * 1024 * 1024;
const MAX_MULTIPART_BYTES = MAX_FILE_BYTES + 256 * 1024;

class UploadTooLargeError extends Error {}

async function readMultipart(request: Request, contentType: string): Promise<FormData> {
  if (Number(request.headers.get("content-length")) > MAX_MULTIPART_BYTES) {
    throw new UploadTooLargeError();
  }
  let size = 0;
  const body = request.body?.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      size += chunk.byteLength;
      if (size > MAX_MULTIPART_BYTES) throw new UploadTooLargeError();
      controller.enqueue(chunk);
    },
  }));
  return new Response(body, { headers: { "Content-Type": contentType } }).formData();
}

export async function POST(request: Request) {
  if (!isApiV1Authorized(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!/^multipart\/form-data(?:;|$)/i.test(contentType)) {
    return NextResponse.json({ error: "Envie multipart/form-data" }, { status: 415 });
  }

  let form: FormData;
  try {
    form = await readMultipart(request, contentType);
  } catch (error) {
    if (error instanceof UploadTooLargeError) {
      return NextResponse.json({ error: "Upload grande demais" }, { status: 413 });
    }
    return NextResponse.json({ error: "Formulário inválido" }, { status: 400 });
  }
  const file = form.get("file");
  const alt = form.get("alt");
  if (!(file instanceof File) || !file.size || !isAllowedImageType(file.type)) {
    return NextResponse.json({ error: "Envie uma imagem válida" }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "Imagem maior que 4 MiB" }, { status: 413 });
  }

  try {
    const authorId = await getApiV1AuthorId();
    if (!authorId || (process.env.VERCEL === "1" && !process.env.BLOB_READ_WRITE_TOKEN)) {
      return NextResponse.json(
        { error: "API de publicação não configurada" },
        { status: 503 },
      );
    }
    const optimized = await optimizeAndStoreImage(
      Buffer.from(await file.arrayBuffer()),
      file.type,
    );
    const [row] = await db
      .insert(media)
      .values({
        alt: typeof alt === "string" ? alt.slice(0, 200) : "",
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
    if (error instanceof InvalidImageError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Falha no upload" }, { status: 500 });
  }
}
