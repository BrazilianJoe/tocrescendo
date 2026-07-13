"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { CoverPicture } from "@/components/blog/CoverPicture";
import { TiptapEditor } from "@/components/admin/TiptapEditor";
import { slugify } from "@/lib/slug";

type PostForm = {
  id?: string;
  title: string;
  summary: string;
  slug?: string;
  status: "DRAFT" | "PUBLISHED";
  content: Record<string, unknown>;
  coverAvifUrl?: string | null;
  coverWebpUrl?: string | null;
  coverAlt?: string;
};

export type { PostForm };

export function PostEditor({ initial }: { initial: PostForm }) {
  const router = useRouter();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(initial.title);
  const [summary, setSummary] = useState(initial.summary);
  const [slug, setSlug] = useState(initial.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.slug));
  const [status, setStatus] = useState(initial.status);
  const [content, setContent] = useState(initial.content);
  const [coverAvifUrl, setCoverAvifUrl] = useState(initial.coverAvifUrl ?? null);
  const [coverWebpUrl, setCoverWebpUrl] = useState(initial.coverWebpUrl ?? null);
  const [coverAlt, setCoverAlt] = useState(initial.coverAlt ?? "");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  async function uploadCover(file: File) {
    setUploadingCover(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("alt", coverAlt || title || "Capa do artigo");
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Falha no upload da capa");
        return;
      }
      setCoverAvifUrl(data.srcAvif);
      setCoverWebpUrl(data.srcWebp);
      if (!coverAlt) setCoverAlt(data.alt || title);
    } catch {
      setError("Erro de rede no upload da capa");
    } finally {
      setUploadingCover(false);
    }
  }

  async function save() {
    setSaving(true);
    setError(null);
    setSavedFlash(false);
    try {
      const payload = {
        id: initial.id,
        title,
        summary,
        content,
        status,
        coverAvifUrl,
        coverWebpUrl,
        coverAlt,
        ...(slug.trim() ? { slug: slugify(slug) || slug.trim() } : {}),
      };

      const res = await fetch("/api/admin/posts", {
        method: initial.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao salvar");
        return;
      }
      if (!initial.id) {
        router.replace(`/admin/posts/${data.id}`);
        router.refresh();
        return;
      }
      setSlug(data.slug ?? slug);
      setSavedFlash(true);
      router.refresh();
    } catch {
      setError("Erro de rede");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!initial.id) return;
    if (!window.confirm("Excluir este artigo?")) return;
    const res = await fetch(`/api/admin/posts/${initial.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.push("/admin/posts");
      router.refresh();
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/posts"
          className="text-sm text-muted transition hover:text-primary-dark"
        >
          ← Artigos
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          {savedFlash ? (
            <span className="text-sm text-primary-dark">Salvo</span>
          ) : null}
          {initial.id && status === "PUBLISHED" ? (
            <Link
              href={`/blog/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-muted transition hover:text-primary-dark"
            >
              Ver no site
            </Link>
          ) : null}
          {initial.id ? (
            <button
              type="button"
              onClick={() => void remove()}
              className="rounded-full px-3 py-1.5 text-sm text-secondary-dark transition hover:bg-secondary-light/30"
            >
              Excluir
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving || !title.trim()}
            className="rounded-full bg-primary-dark px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary disabled:opacity-50"
          >
            {saving ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </div>

      <div className="space-y-5 rounded-[1.25rem] border border-border/80 bg-surface/90 p-5 sm:p-6">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            Título
          </span>
          <input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Ex.: Sinais de alerta na aprendizagem"
            className="font-display mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-2xl font-semibold tracking-tight text-foreground outline-none transition placeholder:font-sans placeholder:text-base placeholder:font-normal placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-3xl"
            required
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            Permalink
          </span>
          <div className="mt-2 flex items-center gap-0 overflow-hidden rounded-2xl border border-border bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
            <span className="shrink-0 border-r border-border bg-background/80 px-3 py-3 text-sm text-muted">
              /blog/
            </span>
            <input
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              onBlur={() => setSlug(slugify(slug) || slug)}
              placeholder="permalink-do-artigo"
              className="w-full bg-transparent px-3 py-3 font-mono text-sm text-foreground outline-none placeholder:text-muted/70"
            />
          </div>
        </label>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            Capa (opcional)
          </span>
          <div className="mt-2 space-y-3">
            {coverWebpUrl || coverAvifUrl ? (
              <div className="overflow-hidden rounded-2xl border border-border">
                <CoverPicture
                  avifUrl={coverAvifUrl}
                  webpUrl={coverWebpUrl}
                  alt={coverAlt || title}
                  className="aspect-[16/9] w-full object-cover"
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-background px-4 py-8 text-center text-sm text-muted">
                Sem capa — a listagem usa só título e trecho do texto.
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-primary-dark transition hover:border-primary/40 disabled:opacity-50"
              >
                {uploadingCover
                  ? "Enviando…"
                  : coverWebpUrl
                    ? "Trocar capa"
                    : "Enviar capa"}
              </button>
              {coverWebpUrl || coverAvifUrl ? (
                <button
                  type="button"
                  onClick={() => {
                    setCoverAvifUrl(null);
                    setCoverWebpUrl(null);
                  }}
                  className="rounded-full px-4 py-2 text-sm text-secondary-dark transition hover:bg-secondary-light/30"
                >
                  Remover
                </button>
              ) : null}
            </div>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadCover(file);
                e.target.value = "";
              }}
            />
            <label className="block">
              <span className="text-xs text-muted">Texto alternativo da capa</span>
              <input
                value={coverAlt}
                onChange={(e) => setCoverAlt(e.target.value)}
                placeholder="Descreva a imagem para acessibilidade"
                className="mt-1.5 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
          </div>
        </div>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            Resumo
          </span>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Opcional — se vazio, usamos um trecho do texto"
            rows={2}
            className="mt-2 w-full resize-y rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <label className="block max-w-xs">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            Status
          </span>
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "DRAFT" | "PUBLISHED")
            }
            className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="DRAFT">Rascunho</option>
            <option value="PUBLISHED">Publicado</option>
          </select>
        </label>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
          Conteúdo
        </p>
        <TiptapEditor initialContent={content} onChange={setContent} />
      </div>

      {error ? (
        <p className="rounded-xl bg-secondary-light/35 px-3 py-2 text-sm text-secondary-dark">
          {error}
        </p>
      ) : null}
    </div>
  );
}
