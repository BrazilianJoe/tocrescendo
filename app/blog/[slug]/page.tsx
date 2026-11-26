import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CoverPicture } from "@/components/blog/CoverPicture";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SocialButtonGroup } from "@/components/ui/SocialButtons";
import { site } from "@/content/site";
import {
  formatReadingTime,
  readingTimeMinutes,
} from "@/lib/post-text";
import { getPublishedPostBySlug } from "@/lib/posts";
import { renderPostHtml } from "@/lib/render-post";
import { sanitizeImageSrc } from "@/lib/safe-url";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return { title: "Artigo não encontrado" };

  const coverImage =
    sanitizeImageSrc(post.coverWebpUrl) ||
    sanitizeImageSrc(post.coverAvifUrl);
  const seoTitle = post.seoTitle?.trim() || post.title;
  const includesSiteName = seoTitle
    .toLocaleLowerCase("pt-BR")
    .includes(site.name.toLocaleLowerCase("pt-BR"));
  const seoDescription =
    post.seoDescription?.trim() || post.summary?.trim() || site.seo.description;
  const postUrl = `${site.url}/blog/${post.slug}`;

  return {
    title: includesSiteName ? { absolute: seoTitle } : seoTitle,
    description: seoDescription,
    alternates: { canonical: postUrl },
    openGraph: {
      type: "article",
      url: postUrl,
      siteName: site.name,
      locale: "pt_BR",
      images: [
        {
          url: new URL(coverImage || site.assets.logoFull, site.url).href,
          alt: coverImage ? post.coverAlt?.trim() || post.title : site.name,
        },
      ],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const html = renderPostHtml(post.content);
  const minutes = readingTimeMinutes(post.content);

  return (
    <>
      <Header />
      <main>
        <article className="px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <p className="text-sm text-muted">
              <Link href="/blog" className="hover:text-primary-dark">
                Blog
              </Link>
              {post.publishedAt ? (
                <>
                  {" · "}
                  {post.publishedAt.toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </>
              ) : null}
              {" · "}
              {formatReadingTime(minutes)}
            </p>
            <h1 className="font-display mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
              {post.title}
            </h1>
            {post.summary ? (
              <p className="mt-4 text-lg leading-relaxed text-muted">
                {post.summary}
              </p>
            ) : null}

            {post.coverWebpUrl || post.coverAvifUrl ? (
              <div className="mt-8 overflow-hidden rounded-2xl">
                <CoverPicture
                  avifUrl={post.coverAvifUrl}
                  webpUrl={post.coverWebpUrl}
                  alt={post.coverAlt?.trim() || post.title}
                  priority
                  className="aspect-[16/9] w-full object-cover"
                />
              </div>
            ) : null}

            <div
              className="prose-blog mt-10"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            <aside className="mt-14 border-t border-border pt-10">
              <p className="text-foreground">
                Dúvidas sobre o desenvolvimento do seu filho? Estou aqui para
                ouvir.
              </p>
              <SocialButtonGroup className="mt-5" whatsappVariant="primary" />
            </aside>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
