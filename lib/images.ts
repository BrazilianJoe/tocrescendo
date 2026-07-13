import { put } from "@vercel/blob";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { randomUUID } from "node:crypto";

const MAX_BYTES = 8 * 1024 * 1024;
const MAX_WIDTH = 1600;

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

export async function optimizeAndStoreImage(
  input: Buffer,
): Promise<OptimizedImageUrls> {
  if (input.byteLength > MAX_BYTES) {
    throw new Error("Imagem maior que 8 MB");
  }

  const base = sharp(input, { failOn: "error" }).rotate();
  const meta = await base.metadata();
  if (!meta.format || !meta.width || !meta.height) {
    throw new Error("Arquivo de imagem inválido");
  }
  const width = Math.min(meta.width, MAX_WIDTH);


  const resized = base.resize({
    width,
    withoutEnlargement: true,
  });

  const [{ data: avifBuf }, { data: webpBuf, info }] = await Promise.all([
    resized.clone().avif({ quality: 55 }).toBuffer({ resolveWithObject: true }),
    resized.clone().webp({ quality: 78 }).toBuffer({ resolveWithObject: true }),
  ]);

  const id = randomUUID();
  const [avifUrl, webpUrl] = await Promise.all([
    storeBinary(`blog/${id}.avif`, avifBuf, "image/avif"),
    storeBinary(`blog/${id}.webp`, webpBuf, "image/webp"),
  ]);

  return {
    avifUrl,
    webpUrl,
    width: info.width,
    height: info.height,
  };
}
