import { del, put } from "@vercel/blob";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { randomUUID } from "node:crypto";

const MAX_BYTES = 8 * 1024 * 1024;
const MAX_DIMENSION = 1600;
const MAX_INPUT_PIXELS = 25_000_000;

const IMAGE_FORMATS: Readonly<Record<string, string>> = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export class InvalidImageError extends Error {}

export function isAllowedImageType(type: string): boolean {
  return Object.hasOwn(IMAGE_FORMATS, type);
}

export type OptimizedImageUrls = {
  avifUrl: string;
  webpUrl: string;
  width: number;
  height: number;
};

async function storeBinary(
  key: string,
  data: Buffer,
  contentType: string,
): Promise<string> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(key, data, {
      access: "public",
      contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return blob.url;
  }

  // Local/dev fallback when Blob token is missing
  const publicDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(publicDir, { recursive: true });
  const filename = key.split("/").pop()!;
  await writeFile(path.join(publicDir, filename), data);
  return `/uploads/${filename}`;
}

async function encodeImage(input: Buffer, declaredType: string | undefined) {
  try {
    const resized = sharp(input, {
      failOn: "error",
      limitInputPixels: MAX_INPUT_PIXELS,
    }).rotate().resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    });
    const meta = await resized.metadata();
    const format = meta.format === "heif" && meta.compression === "av1"
      ? "avif"
      : meta.format;
    if (!format || !meta.width || !meta.height ||
        (declaredType && IMAGE_FORMATS[declaredType] !== format)) {
      throw new InvalidImageError();
    }
    return await Promise.all([
      resized.clone().avif({ quality: 55 }).toBuffer(),
      resized.clone().webp({ quality: 78 }).toBuffer({ resolveWithObject: true }),
    ]);
  } catch {
    throw new InvalidImageError("Arquivo de imagem inválido ou dimensões excessivas");
  }
}

export async function optimizeAndStoreImage(
  input: Buffer,
  declaredType?: string,
): Promise<OptimizedImageUrls> {
  if (input.byteLength > MAX_BYTES) {
    throw new InvalidImageError("Imagem maior que 8 MB");
  }
  const [avif, webp] = await encodeImage(input, declaredType);
  const id = randomUUID();
  const [avifUpload, webpUpload] = await Promise.allSettled([
    storeBinary(`blog/${id}.avif`, avif, "image/avif"),
    storeBinary(`blog/${id}.webp`, webp.data, "image/webp"),
  ]);
  if (avifUpload.status === "rejected" || webpUpload.status === "rejected") {
    const uploaded = [avifUpload, webpUpload].find((upload) => upload.status === "fulfilled");
    if (uploaded) {
      const url = uploaded.value;
      const cleanup = url.startsWith("/uploads/")
        ? rm(path.join(process.cwd(), "public", url), { force: true })
        : del(url);
      await cleanup.catch(() => undefined);
    }
    throw new Error("Falha ao armazenar a imagem");
  }

  return {
    avifUrl: avifUpload.value,
    webpUrl: webpUpload.value,
    width: webp.info.width,
    height: webp.info.height,
  };
}
