import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { privacy } from "@/content/privacy";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: `Privacidade | ${site.name}`,
  description:
    "Política de Privacidade do site Tô Crescendo — tratamento de dados pessoais conforme a LGPD.",
  robots: { index: true, follow: true },
};

export default function PrivacidadePage() {
  return (
    <>
      <Header />
      <main className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <article className="prose-policy mx-auto max-w-3xl">
          <Link
            href="/"
            className="text-sm font-medium text-primary-dark hover:underline"
          >
            ← Voltar ao início
          </Link>

          <h1 className="font-display mt-6 text-3xl font-semibold text-foreground sm:text-4xl">
            {privacy.title}
          </h1>
          <p className="mt-2 text-sm text-muted">
            Última atualização: {privacy.lastUpdated}
          </p>

          <p className="mt-8 leading-relaxed text-muted">{privacy.intro}</p>

          {privacy.sections.map((section) => (
            <section key={section.title} className="mt-10">
              <h2 className="font-display text-xl font-semibold text-foreground">
                {section.title}
              </h2>
              <div className="mt-4 space-y-4">
                {section.paragraphs.map((p) => (
                  <p key={p.slice(0, 48)} className="leading-relaxed text-muted">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}

          <section className="mt-10 rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-display text-lg font-semibold text-foreground">
              {privacy.contact.title}
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              {privacy.contact.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
