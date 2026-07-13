import type { Metadata } from "next";
import Link from "next/link";
import { CoverPicture } from "@/components/blog/CoverPicture";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { site } from "@/content/site";
import {
  formatReadingTime,
  postExcerpt,
  readingTimeMinutes,
} from "@/lib/post-text";
import { listPublishedPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Blog | ${site.name}`,
  description:
    "Artigos sobre neuropsicopedagogia, aprendizagem, TEA, TDAH e desenvolvimento infantil.",
  alternates: { canonical: `${site.url}/blog` },
};

function formatDate(date: Date | null) {
  if (!date) return null;
  return date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function metaLine(date: Date | null, content: unknown) {
  return [formatDate(date), formatReadingTime(readingTimeMinutes(content))]
    .filter(Boolean)
    .join(" · ");
}

export default async function BlogIndexPage() {
  const posts = await listPublishedPosts();
  const [latest, ...rest] = posts;

  return (
    <>
      <Header />
      <main>
        <section className="px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h1 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">
              Blog
            </h1>
            <p className="mt-3 max-w-xl text-lg text-muted">
              Orientação em neuropsicopedagogia, no ritmo das famílias.
            </p>

            {posts.length === 0 ? (
              <p className="mt-12 text-muted">Em breve, novos artigos.</p>
            ) : (
              <div className="mt-12">
                {latest ? (
                  <article>
                    {latest.coverWebpUrl || latest.coverAvifUrl ? (
                      <Link
                        href={`/blog/${latest.slug}`}
                        className="block overflow-hidden rounded-2xl"
                      >
                        <CoverPicture
                          avifUrl={latest.coverAvifUrl}
                          webpUrl={latest.coverWebpUrl}
                          alt={latest.coverAlt || latest.title}
                          priority
                          className="aspect-[16/9] w-full object-cover"
                        />
                      </Link>
                    ) : null}
                    <p
                      className={`text-sm text-muted ${
                        latest.coverWebpUrl || latest.coverAvifUrl
                          ? "mt-5"
                          : ""
                      }`}
                    >
                      {metaLine(latest.publishedAt, latest.content)}
                    </p>
                    <h2 className="font-display mt-2 text-3xl font-semibold leading-tight sm:text-[2rem]">
                      <Link
                        href={`/blog/${latest.slug}`}
                        className="text-foreground hover:text-primary-dark"
                      >
                        {latest.title}
                      </Link>
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed text-muted">
                      {postExcerpt(latest.summary, latest.content, 420)}
                    </p>
                    <p className="mt-5">
                      <Link
                        href={`/blog/${latest.slug}`}
                        className="text-sm font-medium text-primary-dark underline-offset-4 hover:underline"
                      >
                        Continuar lendo
                      </Link>
                    </p>
                  </article>
                ) : null}

                {rest.length > 0 ? (
                  <ul className="mt-14 space-y-10 border-t border-border pt-10">
                    {rest.map((post) => (
                      <li key={post.id}>
                        <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                          {post.coverWebpUrl || post.coverAvifUrl ? (
                            <Link
                              href={`/blog/${post.slug}`}
                              className="block shrink-0 overflow-hidden rounded-xl sm:w-36"
                            >
                              <CoverPicture
                                avifUrl={post.coverAvifUrl}
                                webpUrl={post.coverWebpUrl}
                                alt={post.coverAlt || post.title}
                                className="aspect-[4/3] w-full object-cover sm:aspect-square"
                              />
                            </Link>
                          ) : null}
                          <div className="min-w-0">
                            <p className="text-sm text-muted">
                              {metaLine(post.publishedAt, post.content)}
                            </p>
                            <h3 className="font-display mt-1 text-xl font-semibold">
                              <Link
                                href={`/blog/${post.slug}`}
                                className="text-foreground hover:text-primary-dark"
                              >
                                {post.title}
                              </Link>
                            </h3>
                            <p className="mt-2 leading-relaxed text-muted">
                              {postExcerpt(post.summary, post.content, 180)}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
