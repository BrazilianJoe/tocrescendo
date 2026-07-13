import Link from "next/link";
import { listAllPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const posts = await listAllPosts();
  const published = posts.filter((p) => p.status === "PUBLISHED").length;

  return (
    <div>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-dark">
            Blog
          </p>
          <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Artigos
          </h1>
          <p className="mt-2 text-muted">
            {posts.length === 0
              ? "Comece pelo primeiro texto."
              : `${posts.length} no total · ${published} publicados`}
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center justify-center rounded-full bg-primary-dark px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary"
        >
          Novo artigo
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="mt-10 rounded-[1.5rem] border border-dashed border-border bg-surface/60 px-6 py-14 text-center">
          <p className="font-display text-xl text-foreground">
            Nenhum artigo ainda
          </p>
          <p className="mt-2 text-sm text-muted">
            Escreva com o editor tipográfico e publique quando estiver pronto.
          </p>
          <Link
            href="/admin/posts/new"
            className="mt-6 inline-flex rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-primary-dark transition hover:border-primary/50"
          >
            Criar o primeiro
          </Link>
        </div>
      ) : (
        <ul className="mt-10 space-y-3">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/admin/posts/${post.id}`}
                className="group flex flex-col gap-3 rounded-[1.25rem] border border-border/80 bg-surface/90 px-5 py-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground transition group-hover:text-primary-dark">
                    {post.title || "Sem título"}
                  </p>
                  <p className="mt-1 truncate text-sm text-muted">
                    /blog/{post.slug}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      post.status === "PUBLISHED"
                        ? "bg-primary-light/50 text-primary-dark"
                        : "bg-background text-muted"
                    }`}
                  >
                    {post.status === "PUBLISHED" ? "Publicado" : "Rascunho"}
                  </span>
                  <time className="text-sm text-muted">
                    {post.updatedAt.toLocaleDateString("pt-BR")}
                  </time>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
